import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker parameter is required' }, { status: 400 })
    }

    // Get current ETH price and total ETH holdings for weight calculation
    const systemMetrics = await prisma.systemMetrics.findFirst()
    const ethPrice = systemMetrics?.ethPrice || 3680.0
    const totalEthHoldings = systemMetrics?.totalEthHoldings || 1130020.0

    // Get company data from database
    const company = await prisma.company.findFirst({
      where: {
        ticker: ticker.toUpperCase()
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // ETH price already fetched from systemMetrics above

    // Calculate derived metrics
    const ethValue = (company.ethHoldings || 0) * ethPrice
    const marketCapNumeric = company.marketCap ? parseFloat(company.marketCap.toString()) : 0
    const ecmcPercentage = marketCapNumeric > 0 ? (ethValue / marketCapNumeric) * 100 : 0
    
    // Calculate premium/discount (simplified since we don't have real-time stock price)
    const fairValue = ethValue
    const premiumDiscount = 0 // Will be calculated when we have real-time stock data

    // Generate external links
    const yahooFinanceUrl = `https://finance.yahoo.com/quote/${ticker.toUpperCase()}`
    const secFilingsUrl = `https://www.sec.gov/edgar/browse/?CIK=${company.name.replace(/[^a-zA-Z0-9]/g, '')}&owner=exclude`
    
    // Try to construct company website URL (basic heuristic)
    const companyWebsite = `https://www.${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`

    // Build comprehensive company profile
    const companyProfile = {
      // Basic company info
      id: company.id,
      name: company.name,
      ticker: company.ticker,
      description: `${company.name} is a publicly traded company that has adopted Ethereum (ETH) as a strategic treasury asset. The company holds significant ETH reserves as part of its corporate treasury strategy, providing shareholders with exposure to Ethereum's potential appreciation while maintaining its core business operations. This treasury allocation represents a forward-thinking approach to corporate finance and digital asset adoption.`,
      
      // Financial data (from our existing data)
      stockPrice: 0, // Temporarily disabled until schema migration - company.stockPrice || 0
      marketCap: company.marketCap ? `$${company.marketCap.toString()}` : '$0',
      marketCapNumeric,
      priceChange: 0, // We don't currently track this
      priceChangePercent: 0,
      
      // ETH holdings data
      ethHoldings: company.ethHoldings || 0,
      ethValue,
      ethPrice,
      ecmcPercentage,
      
      // Analytics (calculated)
      premiumDiscount,
      fairValue,
      
      // External links
      yahooFinanceUrl,
      secFilingsUrl,
      companyWebsite,
      
      // Metadata
      lastUpdated: new Date().toISOString(),
      
      // Additional calculated metrics
      ethHoldingsFormatted: company.ethHoldings ? 
        `${company.ethHoldings.toLocaleString()} ETH` : '0 ETH',
      ethWeight: totalEthHoldings > 0 ? ((company.ethHoldings || 0) / totalEthHoldings) * 100 : 0,
      ethValueFormatted: ethValue >= 1e9 ? 
        `$${(ethValue / 1e9).toFixed(2)}B` : 
        ethValue >= 1e6 ? 
          `$${(ethValue / 1e6).toFixed(2)}M` : 
          `$${ethValue.toLocaleString()}`,
      
      // Business info (we can enhance this later)
      sector: '', // Will be enhanced with real data later
      headquarters: 'United States', // Default, can be enhanced
      website: companyWebsite,
      
      // Risk and exposure metrics
      riskLevel: ecmcPercentage > 50 ? 'High' : ecmcPercentage > 20 ? 'Medium' : 'Low'
    }

    return NextResponse.json(companyProfile)

  } catch (error) {
    console.error('Error fetching company profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
