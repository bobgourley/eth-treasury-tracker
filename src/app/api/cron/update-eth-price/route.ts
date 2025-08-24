import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { FALLBACK_ETH_SUPPLY } from '@/lib/constants'

const prisma = new PrismaClient()

/**
 * GET /api/cron/update-eth-price
 * Scheduled endpoint to update ETH price every 5 minutes
 * Called by Vercel Cron Jobs
 */
export async function GET(request: Request) {
  try {
    // Verify this is a cron request (optional security check)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🕐 Starting scheduled ETH price update...')
    
    // Get last known ETH price from database as fallback
    const lastSystemMetrics = await prisma.systemMetrics.findFirst()
    let ethPrice = lastSystemMetrics?.ethPrice || 3680.0 // Only use hardcoded if no database value exists
    let ethPriceSource = 'Last known value (database)'
    let ethPriceLastUpdate = new Date()
    
    // Try to get live ETH price from CoinGecko API
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      if (response.ok) {
        const data = await response.json()
        const newEthPrice = data.ethereum?.usd
        if (newEthPrice && newEthPrice > 0) {
          ethPrice = newEthPrice
          ethPriceSource = 'CoinGecko API (scheduled)'
          ethPriceLastUpdate = new Date()
          console.log('✅ Live ETH price fetched from CoinGecko:', ethPrice)
        } else {
          console.log('⚠️ CoinGecko returned invalid price, using last known value:', ethPrice)
        }
      } else {
        console.log('⚠️ CoinGecko API failed, using last known value:', ethPrice)
      }
    } catch (error) {
      console.log('⚠️ ETH price fetch error, using last known value:', ethPrice, error)
    }

    // Get current companies for calculations
    const companies = await prisma.company.findMany({
      where: { isActive: true }
    })

    // Calculate metrics
    const totalEthHeld = companies.reduce((sum, company) => 
      sum + (company.ethHoldings || 0), 0
    )
    const totalEthValue = totalEthHeld * ethPrice
    const totalMarketCap = companies.reduce((sum, company) => 
      sum + Number(company.marketCap || 0), 0
    )

    // Update system metrics with new ETH price
    await prisma.systemMetrics.upsert({
      where: { id: 1 },
      update: {
        ethPrice: ethPrice,
        totalEthValue: totalEthValue,
        lastUpdate: new Date()
        // ETH price tracking fields will be enabled after schema migration
        // ethPriceLastUpdate: ethPriceLastUpdate,
        // ethPriceSource: ethPriceSource
      },
      create: {
        totalEthHoldings: totalEthHeld,
        totalCompanies: companies.length,
        ethPrice: ethPrice,
        totalEthValue: totalEthValue,
        totalMarketCap: totalMarketCap,
        ethSupplyPercent: (totalEthHeld / FALLBACK_ETH_SUPPLY) * 100,
        lastUpdate: new Date()
        // ETH price tracking fields will be enabled after schema migration
        // ethPriceLastUpdate: ethPriceLastUpdate,
        // ethPriceSource: ethPriceSource
      }
    })

    console.log('✅ Scheduled ETH price update completed')
    
    return NextResponse.json({
      success: true,
      message: 'ETH price updated successfully',
      data: {
        ethPrice: ethPrice,
        ethPriceSource: ethPriceSource,
        totalEthValue: totalEthValue,
        totalCompanies: companies.length,
        lastUpdate: ethPriceLastUpdate.toISOString()
      }
    })

  } catch (error: unknown) {
    console.error('❌ Scheduled ETH price update failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update ETH price',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
