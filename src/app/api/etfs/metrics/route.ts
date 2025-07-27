import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    console.log('📊 Calculating ETF metrics...')
    
    // Get all active ETFs
    const etfs = await prisma.etf.findMany({
      where: { isActive: true }
    })
    
    // Calculate aggregate metrics
    let totalEthHeld = 0
    let totalAum = 0
    let totalValue = 0
    let totalExpenseRatio = 0
    let etfsWithExpenseRatio = 0
    
    for (const etf of etfs) {
      if (etf.ethHoldings) totalEthHeld += etf.ethHoldings
      if (etf.aum) totalAum += etf.aum
      if (etf.totalValue) totalValue += etf.totalValue
      if (etf.expenseRatio) {
        totalExpenseRatio += etf.expenseRatio
        etfsWithExpenseRatio++
      }
    }
    
    const avgExpenseRatio = etfsWithExpenseRatio > 0 ? totalExpenseRatio / etfsWithExpenseRatio : 0
    
    // Get current ETH price (reuse existing logic, read-only)
    let ethPrice = 3500.0 // Fallback
    try {
      const coinGeckoResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
        { next: { revalidate: 300 } }
      )
      
      if (coinGeckoResponse.ok) {
        const coinGeckoData = await coinGeckoResponse.json()
        if (coinGeckoData.ethereum?.usd) {
          ethPrice = coinGeckoData.ethereum.usd
        }
      }
    } catch (error) {
      console.log('⚠️ ETH price fetch failed, using fallback')
    }
    
    // Update or create metrics record
    const metrics = {
      totalEthHeld,
      totalAum,
      totalValue,
      etfCount: etfs.length,
      avgExpenseRatio,
      ethPrice,
      lastUpdate: new Date()
    }
    
    // Try to update existing metrics or create new
    try {
      const existingMetrics = await prisma.etfMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' }
      })
      
      if (existingMetrics) {
        await prisma.etfMetrics.update({
          where: { id: existingMetrics.id },
          data: metrics
        })
      } else {
        await prisma.etfMetrics.create({
          data: metrics
        })
      }
    } catch (dbError) {
      console.log('⚠️ Database update failed, returning calculated metrics')
    }
    
    console.log(`✅ ETF metrics calculated: ${etfs.length} ETFs, ${totalEthHeld.toFixed(2)} ETH`)
    
    return NextResponse.json({
      ...metrics,
      formattedTotalAum: formatNumber(totalAum),
      formattedTotalValue: formatNumber(totalValue),
      formattedTotalEthHeld: formatEth(totalEthHeld)
    })
    
  } catch (error) {
    console.error('❌ Error calculating ETF metrics:', error)
    
    // Fallback metrics
    return NextResponse.json({
      totalEthHeld: 0,
      totalAum: 0,
      totalValue: 0,
      etfCount: 9,
      avgExpenseRatio: 0.75,
      ethPrice: 3500,
      lastUpdate: new Date(),
      formattedTotalAum: '$0',
      formattedTotalValue: '$0',
      formattedTotalEthHeld: '0 ETH',
      message: 'Using fallback metrics'
    })
  } finally {
    await prisma.$disconnect()
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
