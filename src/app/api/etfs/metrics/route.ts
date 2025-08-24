import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { FALLBACK_ETH_SUPPLY, FALLBACK_ETH_PRICE } from '@/lib/constants'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Fetch ETF data from our API endpoint
    const etfsResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/etfs`, {
      next: { revalidate: 300 } // Cache for 5 minutes
    })
    
    let etfs = []
    if (etfsResponse.ok) {
      const etfsData = await etfsResponse.json()
      etfs = etfsData.etfs || []
    }
    
    // Calculate aggregate metrics
    let totalEthHeld = 0
    let totalValue = 0
    let totalAum = 0
    let activeEtfs = 0
    
    etfs.forEach((etf: { isActive?: boolean; ethHoldings?: number; totalValue?: number; aum?: number }) => {
      if (etf.isActive) {
        totalEthHeld += etf.ethHoldings || 0
        totalValue += etf.totalValue || 0
        totalAum += etf.aum || 0
        activeEtfs++
      }
    })
    
    // Format for display
    function formatEth(value: number): string {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value)
    }
    
    // Get current ETH price from database (consistent with other pages)
    let ethPrice = FALLBACK_ETH_PRICE // Fallback
    let ethSupply = FALLBACK_ETH_SUPPLY // Fallback ETH supply
    
    try {
      // Use database-first approach for consistency with other pages
      const systemMetrics = await prisma.systemMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' }
      })
      
      if (systemMetrics?.ethPrice) {
        ethPrice = systemMetrics.ethPrice
        console.log(`📊 ETF metrics using ETH price from database: $${ethPrice}`)
      } else {
        // Fallback to ecosystem summary table
        const ecosystemSummary = await prisma.ecosystemSummary.findFirst({
          orderBy: { lastUpdated: 'desc' }
        })
        if (ecosystemSummary?.ethPrice) {
          ethPrice = ecosystemSummary.ethPrice
          console.log(`📊 ETF metrics using ETH price from ecosystem: $${ethPrice}`)
        }
      }
    } catch {
      console.log('⚠️ ETH price fetch from database failed, using fallback')
    }
    
    // Get ETH supply from database (consistent with other pages)
    try {
      const ecosystemData = await prisma.ecosystemSummary.findFirst({
        orderBy: { lastUpdated: 'desc' },
        select: { ethSupply: true }
      })
      
      if (ecosystemData?.ethSupply) {
        ethSupply = ecosystemData.ethSupply
        console.log(`📊 ETF metrics using ETH supply from database: ${ethSupply.toLocaleString()}`)
      }
    } catch {
      console.log('⚠️ ETH supply fetch from database failed, using fallback')
    }
    
    const ethSupplyPercentage = (totalEthHeld / ethSupply) * 100
    
    return NextResponse.json({
      totalEthHeld,
      totalValue,
      totalAum,
      activeEtfs,
      ethPrice,
      ethSupply,
      ethSupplyPercentage,
      lastUpdated: new Date(),
      formattedTotalValue: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(totalValue),
      formattedTotalAum: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(totalAum),
      formattedTotalEthHeld: formatEth(totalEthHeld),
      formattedEthSupplyPercentage: `${ethSupplyPercentage.toFixed(3)}%`
    })
    
  } catch (metricsError) {
    console.error('❌ ETF metrics error:', metricsError)
    
    // Get fallback data from database if possible
    let fallbackEthPrice = 3825.95
    let fallbackEthSupply = 120000000
    try {
      const systemMetrics = await prisma.systemMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' },
        select: { ethPrice: true }
      })
      fallbackEthPrice = systemMetrics?.ethPrice || 3825.95
      
      // Try to get ETH supply from API
      const { getTotalEthSupply } = await import('@/lib/api')
      fallbackEthSupply = await getTotalEthSupply()
    } catch (error) {
      console.error('Failed to get fallback data:', error)
    }

    const fallbackEthHeld = 2500000
    // Fallback metrics
    return NextResponse.json({
      totalEthHeld: fallbackEthHeld,
      totalValue: fallbackEthHeld * fallbackEthPrice,
      totalAum: fallbackEthHeld * fallbackEthPrice * 1.05, // Slight premium
      activeEtfs: 9,
      ethPrice: fallbackEthPrice,
      ethSupply: fallbackEthSupply,
      lastUpdated: new Date(),
      formattedTotalValue: '$9.5B',
      formattedTotalAum: '$10.0B',
      formattedTotalEthHeld: '2,500,000.00',
      message: 'Using fallback ETF metrics'
    })
  }
}

// Helper functions (isolated from company utils)
function formatNumber(value: number): string {
  if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`
  }
  return `$${value.toFixed(2)}`
}

function formatEth(value: number): string {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M ETH`
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K ETH`
  }
  return `${value.toFixed(2)} ETH`
}
