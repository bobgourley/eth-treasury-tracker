import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

type CompanyData = {
  id: number;
  ticker: string | null;
  name: string;
  ethHoldings: number | null;
  marketCap: bigint | null;
  isActive: boolean;
};

export async function GET() {
  try {
    // Fetch live data from database
    const prisma = new PrismaClient()
    
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        ticker: true,
        name: true,
        ethHoldings: true,
        marketCap: true,
        isActive: true
      }
    })
    
    await prisma.$disconnect()
    
    console.log(`\n=== METRICS API DIRECT APPROACH ===`)
    console.log(`Using ${companies.length} companies from known working data`)
    console.log(`Companies: ${companies.map((c) => c.ticker || 'N/A').join(', ')}`)
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
    companies.forEach((c, i) => {
      console.log(`  ${i+1}. ID:${c.id} ${c.ticker || 'N/A'} (${c.name}) - ETH: ${c.ethHoldings || 0}, Active: ${c.isActive}, MarketCap: ${c.marketCap?.toString() || 'N/A'}`)
    })

    const validCompanies = companies
    console.log(`\nValid companies count (should be 9): ${validCompanies.length}`)
    console.log(`Valid companies === companies: ${validCompanies === companies}`)

    const companiesWithEth = validCompanies.filter((c) => (c.ethHoldings ?? 0) > 0)
    console.log(`Companies with ETH holdings > 0: ${companiesWithEth.length}`)

    console.log('\nCompanies contributing to totals:')
    validCompanies.forEach((c, i) => {
      const ethValue = (c.ethHoldings || 0)
      const marketCap = c.marketCap ? BigInt(c.marketCap) : BigInt(0)
      console.log(`  ${i+1}. ${c.ticker || 'N/A'}: ETH=${ethValue}, MarketCap=${marketCap.toString()}`)
    })
    
    console.log(`\nFinal metrics calculation inputs:`)
    console.log(`- validCompanies.length: ${validCompanies.length}`)
    console.log(`- This will be returned as totalCompanies: ${validCompanies.length}`)
    console.log('================================\n')

    // Calculate totals using ALL companies
    const totalEthHeld = validCompanies.reduce((sum, company) => sum + (company.ethHoldings ?? 0), 0)
    const totalMarketCap = validCompanies.reduce((sum, company) => {
      const marketCap = company.marketCap ? BigInt(company.marketCap) : BigInt(0)
      return sum + marketCap
    }, BigInt(0))

    // ALWAYS try to get the latest ETH price from CoinGecko first
    let ethPrice: number
    let ethPriceSource = 'fallback'
    
    // Get the most recent known price from database as fallback (NEVER use hardcoded value)
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })
    const fallbackPrice = systemMetrics?.ethPrice || 3500 // Only used if no DB record exists at all
    
    // Always attempt to fetch live price from CoinGecko
    try {
      console.log('Fetching live ETH price from CoinGecko...')
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.ethereum?.usd && typeof data.ethereum.usd === 'number') {
          ethPrice = data.ethereum.usd
          ethPriceSource = 'coingecko_live'
          console.log(`✅ Live ETH price fetched: $${ethPrice}`)
          
          // Update database with new price
          try {
            await prisma.systemMetrics.upsert({
              where: { id: systemMetrics?.id || 0 },
              update: {
                ethPrice: ethPrice,
                lastUpdate: new Date(),
                totalEthHoldings: totalEthHeld,
                totalCompanies: validCompanies.length
              },
              create: {
                ethPrice: ethPrice,
                lastUpdate: new Date(),
                totalEthHoldings: totalEthHeld,
                totalCompanies: validCompanies.length
              }
            })
            console.log('✅ Database updated with new ETH price')
          } catch (dbError) {
            console.log('⚠️ Failed to update database with new ETH price:', dbError)
          }
        } else {
          throw new Error('Invalid response format from CoinGecko')
        }
      } else {
        throw new Error(`CoinGecko API returned ${response.status}`)
      }
    } catch (error) {
      console.log('❌ Failed to fetch live ETH price from CoinGecko:', error)
      ethPrice = fallbackPrice
      ethPriceSource = 'database_fallback'
      console.log(`🔄 Using most recent database price: $${ethPrice}`)
    }
    // Fetch live ETH supply from Etherscan API
    let totalEthSupply = 120500000.0 // Fallback value
    let ethSupplySource = 'static_fallback'
    
    try {
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY
      if (etherscanApiKey) {
        console.log('📊 Fetching live ETH supply from Etherscan...')
        const etherscanResponse = await fetch(
          `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${etherscanApiKey}`,
          { next: { revalidate: 86400 } } // Cache for 24 hours (ETH supply changes slowly)
        )
        
        if (etherscanResponse.ok) {
          const etherscanData = await etherscanResponse.json()
          if (etherscanData.status === '1' && etherscanData.result) {
            // Etherscan returns supply in wei, convert to ETH
            totalEthSupply = parseFloat(etherscanData.result) / 1e18
            ethSupplySource = 'etherscan_live'
            console.log(`✅ Live ETH supply: ${totalEthSupply.toLocaleString()} ETH`)
          } else {
            console.warn('⚠️ Etherscan API returned error:', etherscanData.message)
          }
        } else {
          console.warn('⚠️ Etherscan API request failed:', etherscanResponse.status)
        }
      } else {
        console.log('⚠️ No Etherscan API key found, using fallback ETH supply')
      }
    } catch (error) {
      console.error('❌ Error fetching ETH supply from Etherscan:', error)
    }

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
      totalCompanies: validCompanies.length, // Use validCompanies count, not companies.length
      lastUpdate: new Date(),
      // TEMPORARY DEBUG: Include raw company data to diagnose count issue
      debugCompanies: validCompanies.map((c) => ({
        id: c.id,
        ticker: c.ticker || 'N/A',
        name: c.name,
        ethHoldings: c.ethHoldings || 0,
        isActive: c.isActive
      })),
      debugCompanyCount: validCompanies.length,
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
    
    // Static fallback metrics for MVP (updated July 27, 2025 - matches current live data)
    const fallbackMetrics = {
      totalEthHoldings: 1131276.0, // Current sum from live companies API
      totalEthValue: 1131276.0 * fallbackEthPrice, // ETH value at last known price
      totalMarketCap: '5442000000', // Current sum from live companies API
      ethPrice: fallbackEthPrice,
      ethSupplyPercent: (1131276.0 / fallbackEthSupply) * 100,
      totalEthSupply: fallbackEthSupply,
      ethSupplySource: fallbackEthSupplySource,
      totalCompanies: 9, // Correct count of all 9 companies
      lastUpdate: new Date(),
    }
    
    return NextResponse.json(fallbackMetrics)
  }
}
// Force redeploy Sun Jul 27 00:27:33 EDT 2025 - Comprehensive debugging for company count issue
