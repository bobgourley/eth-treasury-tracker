import { NextResponse } from 'next/server'
import { updateSystemMetrics } from '@/lib/dataFetcher'
import { prisma } from '@/lib/db'
import { formatNumber, formatEth } from '@/lib/utils'
import { ETH_SUPPLY } from '@/lib/constants'

export async function POST() {
  try {
    console.log('🔄 Admin request to update system metrics...')
    
    await updateSystemMetrics()
    
    // Fetch updated data to return detailed stats
    const [companies, systemMetrics] = await Promise.all([
      prisma.company.findMany({
        where: { isActive: true },
        orderBy: { ethHoldings: 'desc' }
      }),
      prisma.systemMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' }
      })
    ])
    
    if (!systemMetrics || !systemMetrics.ethPrice) {
      throw new Error('No system metrics or ETH price found after update')
    }
    
    // Calculate totals
    const totalEthHoldings = companies.reduce((sum, company) => sum + (company.ethHoldings || 0), 0)
    const totalEthValue = totalEthHoldings * systemMetrics.ethPrice
    const totalMarketCap = companies.reduce((sum, company) => sum + Number(company.marketCap || 0), 0)
    
    // Get ETH supply from database (updated by updateSystemMetrics function)
    const ecosystemData = await prisma.ecosystemSummary.findFirst({
      orderBy: { lastUpdated: 'desc' },
      select: { ethSupply: true }
    })
    const ethSupply = ecosystemData?.ethSupply || ETH_SUPPLY // Fallback only if no database data
    const ethSupplyPercent = ((totalEthHoldings / ethSupply) * 100).toFixed(3) + '%'
    
    return NextResponse.json({
      success: true,
      message: `Successfully updated ${companies.length} companies with live API data`,
      timestamp: new Date().toISOString(),
      stats: {
        companiesUpdated: companies.length,
        totalCompanies: companies.length,
        ethPrice: systemMetrics.ethPrice,
        totalEthHoldings,
        totalEthValue,
        totalMarketCap,
        ethSupplyPercent
      },
      companies: companies.map(company => ({
        name: company.name,
        ticker: company.ticker,
        ethHoldings: company.ethHoldings,
        ethValue: (company.ethHoldings || 0) * (systemMetrics.ethPrice || 0),
        marketCap: company.marketCap ? Number(company.marketCap) : null,
        lastUpdated: company.lastUpdated.toISOString()
      }))
    })
    
  } catch (error) {
    console.error('❌ Error in update-metrics endpoint:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update system metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Allow GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to update system metrics with live API data',
    endpoint: '/api/admin/update-metrics',
    method: 'POST'
  })
}
