import { NextResponse } from 'next/server'

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
    
    // Get current ETH price
    let ethPrice = 3825.95 // Fallback
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
    } catch {
      console.log('⚠️ ETF metrics fetch failed, using fallback')
    }
    
    return NextResponse.json({
      totalEthHeld,
      totalValue,
      totalAum,
      activeEtfs,
      ethPrice,
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
      formattedTotalEthHeld: formatEth(totalEthHeld)
    })
    
  } catch (metricsError) {
    console.error('❌ ETF metrics error:', metricsError)
    
    // Fallback metrics
    return NextResponse.json({
      totalEthHeld: 2500000,
      totalValue: 9500000000,
      totalAum: 10000000000,
      activeEtfs: 9,
      ethPrice: 3825.95,
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
