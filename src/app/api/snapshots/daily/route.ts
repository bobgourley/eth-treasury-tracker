import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting daily snapshot capture...')
    
    // Get current date (start of day in UTC)
    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    
    // Check if snapshot already exists for today
    const existingSnapshot = await prisma.dailySnapshot.findUnique({
      where: { date: today }
    })
    
    if (existingSnapshot) {
      console.log('📊 Daily snapshot already exists for today')
      return NextResponse.json({
        message: 'Daily snapshot already exists for today',
        snapshot: existingSnapshot
      })
    }
    
    // Fetch all active companies
    const companies = await prisma.company.findMany({
      where: { isActive: true }
    })
    
    console.log(`📈 Processing ${companies.length} active companies...`)
    
    // Calculate totals
    let totalEthHoldings = 0
    let totalMarketCap = 0
    let validCompanies = 0
    
    for (const company of companies) {
      if (company.ethHoldings && company.ethHoldings > 0) {
        totalEthHoldings += company.ethHoldings
        validCompanies++
      }
      
      if (company.marketCap && company.marketCap > 0) {
        totalMarketCap += Number(company.marketCap)
      }
    }
    
    // Get current ETH price (try multiple sources)
    let ethPrice = 3500.0 // Fallback price
    let ethPriceSource = 'fallback'
    
    try {
      // Try CoinGecko first
      const coinGeckoResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        { next: { revalidate: 300 } } // 5 minute cache
      )
      
      if (coinGeckoResponse.ok) {
        const coinGeckoData = await coinGeckoResponse.json()
        if (coinGeckoData.ethereum?.usd) {
          ethPrice = coinGeckoData.ethereum.usd
          ethPriceSource = 'coingecko'
          console.log(`💰 ETH price from CoinGecko: $${ethPrice}`)
        }
      }
    } catch (error) {
      console.log('⚠️ CoinGecko API failed, trying database fallback...')
      
      // Try to get last known price from system_metrics
      try {
        const lastMetrics = await prisma.systemMetrics.findFirst({
          orderBy: { lastUpdate: 'desc' }
        })
        
        if (lastMetrics?.ethPrice) {
          ethPrice = lastMetrics.ethPrice
          ethPriceSource = 'database'
          console.log(`💰 ETH price from database: $${ethPrice}`)
        }
      } catch (dbError) {
        console.log('⚠️ Database fallback failed, using static fallback')
      }
    }
    
    // Get current ETH supply
    let totalEthSupply: number | null = null
    let ethSupplyPercent: number | null = null
    
    try {
      const etherscanApiKey = process.env.ETHERSCAN_API_KEY
      if (etherscanApiKey) {
        console.log('🔍 Fetching current ETH supply from Etherscan...')
        const etherscanResponse = await fetch(
          `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${etherscanApiKey}`,
          { next: { revalidate: 86400 } } // 24 hour cache
        )
        
        if (etherscanResponse.ok) {
          const etherscanData = await etherscanResponse.json()
          if (etherscanData.status === '1' && etherscanData.result) {
            totalEthSupply = parseFloat(etherscanData.result) / 1e18
            ethSupplyPercent = (totalEthHoldings / totalEthSupply) * 100
            console.log(`⛽ ETH supply: ${totalEthSupply.toLocaleString()} ETH`)
          }
        }
      }
    } catch (error) {
      console.log('⚠️ ETH supply fetch failed, using null values')
    }
    
    // Calculate total ETH value
    const totalEthValue = totalEthHoldings * ethPrice
    
    // Create daily snapshot
    const snapshot = await prisma.dailySnapshot.create({
      data: {
        date: today,
        totalEthHoldings,
        totalEthValue,
        totalMarketCap,
        ethPrice,
        totalEthSupply,
        ethSupplyPercent,
        companyCount: validCompanies
      }
    })
    
    console.log('✅ Daily snapshot created successfully!')
    console.log(`📊 Snapshot data:`)
    console.log(`   - Date: ${today.toISOString().split('T')[0]}`)
    console.log(`   - Total ETH Holdings: ${totalEthHoldings.toLocaleString()} ETH`)
    console.log(`   - Total ETH Value: $${totalEthValue.toLocaleString()}`)
    console.log(`   - Total Market Cap: $${totalMarketCap.toLocaleString()}`)
    console.log(`   - ETH Price: $${ethPrice} (${ethPriceSource})`)
    console.log(`   - Company Count: ${validCompanies}`)
    if (ethSupplyPercent) {
      console.log(`   - ETH Supply %: ${ethSupplyPercent.toFixed(4)}%`)
    }
    
    return NextResponse.json({
      message: 'Daily snapshot created successfully',
      snapshot,
      debug: {
        ethPriceSource,
        companiesProcessed: companies.length,
        validCompanies
      }
    })
    
  } catch (error) {
    console.error('❌ Error creating daily snapshot:', error)
    return NextResponse.json({
      error: 'Failed to create daily snapshot',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to retrieve historical snapshots
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const limit = Math.min(days, 365) // Max 1 year of data
    
    const snapshots = await prisma.dailySnapshot.findMany({
      orderBy: { date: 'desc' },
      take: limit
    })
    
    return NextResponse.json({
      snapshots: snapshots.reverse(), // Return in chronological order
      count: snapshots.length
    })
    
  } catch (error) {
    console.error('❌ Error fetching daily snapshots:', error)
    return NextResponse.json({
      error: 'Failed to fetch daily snapshots',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
