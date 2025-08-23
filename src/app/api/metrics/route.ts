import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getEthPriceFromDatabase } from '@/lib/databaseHelpers'
import { ETH_SUPPLY } from '@/lib/constants'

interface CompanyData {
  id: number;
  ticker: string | null;
  name: string;
  ethHoldings: number | null;
  marketCap: bigint | null;
  isActive: boolean;
};

export async function GET() {
  const prisma = new PrismaClient()
  try {
    // Fetch live data from database with explicit connection
    await prisma.$connect()
    
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        ticker: true,
        name: true,
        ethHoldings: true,
        marketCap: true,
        isActive: true
      },
      orderBy: { ethHoldings: 'desc' }
    })
    
    await prisma.$disconnect()
    
    console.log(`\n=== METRICS API DIRECT APPROACH ===`)
    console.log(`Using ${companies.length} companies from known working data`)
    console.log(`Companies: ${companies.map((c: CompanyData) => c.ticker || 'N/A').join(', ')}`)
    console.log('====================================\n')

    // COMPREHENSIVE DEBUGGING to identify company count discrepancy
    console.log(`\n=== METRICS API COMPREHENSIVE DEBUG ===`)
    console.log(`Raw companies array length: ${companies.length}`)
    console.log(`Raw companies array type: ${typeof companies}`)
    console.log(`Raw companies array is array: ${Array.isArray(companies)}`)
    
    if (companies.length === 0) {
      console.log('ERROR: No companies returned from database query!')
      console.log('This suggests a database connection or query issue')
    }
    
    console.log('\nAll companies with full details:')
    companies.forEach((c: CompanyData, i: number) => {
      console.log(`  ${i+1}. ID:${c.id} ${c.ticker || 'N/A'} (${c.name}) - ETH: ${c.ethHoldings || 0}, Active: ${c.isActive}, MarketCap: ${c.marketCap?.toString() || 'N/A'}`)
    })

    const activeCompanies = companies.filter((c: CompanyData) => c.isActive)
    console.log(`\nValid companies count (should be 9): ${activeCompanies.length}`)
    console.log(`Valid companies === companies: ${activeCompanies === companies}`)

    const companiesWithEth = activeCompanies.filter((c: CompanyData) => (c.ethHoldings ?? 0) > 0)
    console.log(`Companies with ETH holdings > 0: ${companiesWithEth.length}`)

    console.log('\nCompanies contributing to totals:')
    activeCompanies.forEach((c, i) => {
      const ethValue = (c.ethHoldings || 0)
      const marketCap = c.marketCap || BigInt(0)
      console.log(`  ${i+1}. ${c.ticker || 'N/A'}: ETH=${ethValue}, MarketCap=${marketCap.toString()}`)
    })
    
    console.log(`\nFinal metrics calculation inputs:`)
    console.log(`- activeCompanies.length: ${activeCompanies.length}`)
    console.log(`- This will be returned as totalCompanies: ${activeCompanies.length}`)
    console.log('================================\n')

    // Calculate totals using ALL companies
    const totalEthHeld = activeCompanies.reduce((sum: number, company: CompanyData) => sum + Number(company.ethHoldings || 0), 0)
    const totalMarketCap = activeCompanies.reduce((sum: number, company: CompanyData) => sum + Number(company.marketCap || 0), 0)

    // ALWAYS try to get the latest ETH price from CoinGecko first
    let ethPrice: number
    let ethPriceSource = 'fallback'
    
    // Get ETH price from database only - no external API calls during page requests
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })
    
    if (systemMetrics?.ethPrice) {
      ethPrice = systemMetrics.ethPrice
      ethPriceSource = 'database'
      console.log(`📊 ETH price from database: $${ethPrice}`)
    } else {
      // Only used if no DB record exists at all (first deployment)
      ethPrice = 3500
      ethPriceSource = 'fallback'
      console.warn('⚠️ No ETH price found in database, using fallback')
    }
    // Get ETH supply from database (stored by admin updates from Etherscan API)
    const ecosystemData = await prisma.ecosystemSummary.findFirst({
      orderBy: { lastUpdated: 'desc' },
      select: { ethSupply: true, lastUpdated: true }
    })
    
    const totalEthSupply = ecosystemData?.ethSupply || ETH_SUPPLY // Fallback only if no database data
    const ethSupplySource = ecosystemData ? 'database_live' : 'fallback_constant'
    console.log(` ETH supply from ${ethSupplySource}: ${totalEthSupply.toLocaleString()} ETH`)

    // Calculate derived metrics
    const totalEthValue = totalEthHeld * ethPrice
    const ethSupplyPercentage = (totalEthHeld / totalEthSupply) * 100

    const metrics = {
      totalEthHoldings: totalEthHeld,
      totalEthValue,
      totalMarketCap: totalMarketCap.toString(),
      ethPrice,
      ethSupplyPercent: ethSupplyPercentage,
      totalEthSupply,
      ethSupplySource,
      totalCompanies: activeCompanies.length, // Use activeCompanies count, not companies.length
      lastUpdate: new Date(),
      // TEMPORARY DEBUG: Include raw company data to diagnose count issue
      debugCompanies: activeCompanies.map((c) => ({
        id: c.id,
        ticker: c.ticker || 'N/A',
        name: c.name,
        ethHoldings: c.ethHoldings || 0,
        isActive: c.isActive
      })),
      debugCompanyCount: activeCompanies.length,
      debugRawCount: companies.length,
      // ETH price tracking fields (will be enabled after schema migration)
      // ethPriceLastUpdate: systemMetrics?.ethPriceLastUpdate || new Date(),
      // ethPriceSource: systemMetrics?.ethPriceSource || 'CoinGecko API',
    }

    return NextResponse.json(metrics)
  } catch (error: unknown) {
    console.error('Database error, using static fallback metrics:', error)
    
    // Try to get last known ETH price from database even in fallback mode
    let fallbackEthPrice = 3500.0 // Only if absolutely no data exists
    try {
      const fallbackPrisma = new PrismaClient()
      const lastKnownMetrics = await fallbackPrisma.systemMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' }
      })
      if (lastKnownMetrics?.ethPrice) {
        fallbackEthPrice = lastKnownMetrics.ethPrice
        console.log('Using last known ETH price from database:', fallbackEthPrice)
      } else {
        console.log('No database ETH price available, using emergency fallback:', fallbackEthPrice)
      }
      await fallbackPrisma.$disconnect()
    } catch (dbError) {
      console.log('Cannot access database for ETH price, using emergency fallback:', fallbackEthPrice)
    }
    
    // Try to get live ETH supply even in fallback mode
    let fallbackEthSupply = 120500000.0 // Static fallback
    let fallbackEthSupplySource = 'static_fallback'
    try {
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY
      if (etherscanApiKey) {
        console.log('📊 Attempting to fetch live ETH supply in fallback mode...')
        const etherscanResponse = await fetch(
          `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${etherscanApiKey}`,
          { next: { revalidate: 86400 } } // Cache for 24 hours
        )
        
        if (etherscanResponse.ok) {
          const etherscanData = await etherscanResponse.json()
          if (etherscanData.status === '1' && etherscanData.result) {
            fallbackEthSupply = parseFloat(etherscanData.result) / 1e18
            fallbackEthSupplySource = 'etherscan_live_fallback'
            console.log(`✅ Live ETH supply in fallback: ${fallbackEthSupply.toLocaleString()} ETH`)
          }
        }
      }
    } catch (error) {
      console.log('Could not fetch live ETH supply in fallback mode, using static value')
    }
    
    // Get current data from companies API to ensure consistency
    let fallbackEthHoldings = 1131276.0
    let fallbackMarketCap = '5442000000'
    
    try {
      const companiesResponse = await fetch(`${process.env.NEXTAUTH_URL || 'https://ethereumlist.com'}/api/companies`)
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json()
        const companies = companiesData.companies || []
        fallbackEthHoldings = companies.reduce((sum: number, company: any) => sum + (company.ethHoldings || 0), 0)
        fallbackMarketCap = companies.reduce((sum: number, company: any) => sum + Number(company.marketCap || 0), 0).toString()
        console.log(`📊 Using live companies data in fallback: ${fallbackEthHoldings} ETH from ${companies.length} companies`)
      }
    } catch (error) {
      console.log('Could not fetch live companies data for fallback, using static values')
    }
    
    // Static fallback metrics for MVP (updated with live data when possible)
    const fallbackMetrics = {
      totalEthHoldings: fallbackEthHoldings,
      totalEthValue: fallbackEthHoldings * fallbackEthPrice,
      totalMarketCap: fallbackMarketCap,
      ethPrice: fallbackEthPrice,
      ethSupplyPercent: (fallbackEthHoldings / fallbackEthSupply) * 100,
      totalEthSupply: fallbackEthSupply,
      ethSupplySource: fallbackEthSupplySource,
      totalCompanies: 9,
      lastUpdate: new Date(),
    }
    
    return NextResponse.json(fallbackMetrics)
  }
}
// Force redeploy Sun Jul 27 00:27:33 EDT 2025 - Comprehensive debugging for company count issue
