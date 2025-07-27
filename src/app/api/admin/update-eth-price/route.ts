import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual ETH price update requested...')
    
    // Fetch current ETH price from CoinGecko
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })
    
    if (!response.ok) {
      throw new Error(`CoinGecko API returned ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    if (!data.ethereum?.usd || typeof data.ethereum.usd !== 'number') {
      throw new Error('Invalid ETH price data from CoinGecko')
    }
    
    const newEthPrice = data.ethereum.usd
    console.log(`✅ Fetched live ETH price: $${newEthPrice}`)
    
    // Get existing system metrics
    const existingMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })
    
    // Update or create system metrics with new ETH price
    const updatedMetrics = await prisma.systemMetrics.upsert({
      where: { id: existingMetrics?.id || 0 },
      update: {
        ethPrice: newEthPrice,
        lastUpdate: new Date(),
      },
      create: {
        ethPrice: newEthPrice,
        lastUpdate: new Date(),
        totalEthHoldings: 0, // Will be updated by metrics API
        totalCompanies: 0, // Will be updated by metrics API
      }
    })
    
    console.log('✅ Database updated with new ETH price')
    
    return NextResponse.json({
      success: true,
      message: 'ETH price updated successfully',
      data: {
        previousPrice: existingMetrics?.ethPrice || null,
        newPrice: newEthPrice,
        priceChange: existingMetrics?.ethPrice ? newEthPrice - existingMetrics.ethPrice : null,
        priceChangePercent: existingMetrics?.ethPrice ? 
          ((newEthPrice - existingMetrics.ethPrice) / existingMetrics.ethPrice * 100).toFixed(2) + '%' : null,
        lastUpdate: updatedMetrics.lastUpdate,
        source: 'CoinGecko API'
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to update ETH price:', error)
    
    // Try to get the last known price as fallback info
    let lastKnownPrice = null
    try {
      const lastMetrics = await prisma.systemMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' }
      })
      lastKnownPrice = lastMetrics?.ethPrice || null
    } catch (dbError) {
      console.error('Cannot access database for fallback price:', dbError)
    }
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: {
        lastKnownPrice,
        source: 'database_fallback'
      }
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}

// GET endpoint to check current ETH price status
export async function GET() {
  try {
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })
    
    if (!systemMetrics) {
      return NextResponse.json({
        success: false,
        message: 'No ETH price data found in database'
      }, { status: 404 })
    }
    
    const now = new Date()
    const lastUpdate = new Date(systemMetrics.lastUpdate)
    const minutesSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60))
    
    return NextResponse.json({
      success: true,
      data: {
        currentPrice: systemMetrics.ethPrice,
        lastUpdate: systemMetrics.lastUpdate,
        minutesSinceUpdate,
        isStale: minutesSinceUpdate > 60, // Consider stale if older than 1 hour
        source: 'database'
      }
    })
    
  } catch (error) {
    console.error('Error checking ETH price status:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
    
  } finally {
    await prisma.$disconnect()
  }
}
