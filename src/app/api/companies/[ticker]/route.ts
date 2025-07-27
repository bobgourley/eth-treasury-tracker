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

    // Get company data from database
    const company = await prisma.company.findFirst({
      where: {
        ticker: ticker.toUpperCase()
      }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get current ETH price from CoinGecko
    let ethPrice = 3500 // fallback price
    try {
      const ethResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      if (ethResponse.ok) {
        const ethData = await ethResponse.json()
        ethPrice = ethData.ethereum?.usd || 3500
      }
    } catch (error) {
      console.error('Error fetching ETH price:', error)
    }

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
      description: `${company.name} is a publicly traded company that holds Ethereum as a strategic treasury asset.`,
      
      // Financial data (from our existing data)
      stockPrice: 0, // We'll get this from Alpha Vantage later
      marketCap: company.marketCap ? company.marketCap.toString() : '$0',
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
        company.ethHoldings >= 1000 ? 
          `${Math.round(company.ethHoldings / 1000).toLocaleString()}k ETH` : 
          `${Math.round(company.ethHoldings).toLocaleString()} ETH`
        : '0 ETH',
      ethValueFormatted: ethValue >= 1e9 ? 
        `$${(ethValue / 1e9).toFixed(2)}B` : 
        ethValue >= 1e6 ? 
          `$${(ethValue / 1e6).toFixed(2)}M` : 
          `$${ethValue.toLocaleString()}`,
      
      // Business info (we can enhance this later)
      sector: 'Technology', // Default, can be enhanced
      headquarters: 'United States', // Default, can be enhanced
      website: companyWebsite,
      
      // Risk and exposure metrics
      riskLevel: ecmcPercentage > 50 ? 'High' : ecmcPercentage > 20 ? 'Medium' : 'Low',
      exposureCategory: ecmcPercentage > 30 ? 'ETH-Focused' : ecmcPercentage > 10 ? 'ETH-Exposed' : 'ETH-Light'
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
