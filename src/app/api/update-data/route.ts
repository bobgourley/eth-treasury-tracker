import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * POST /api/update-data
 * Simplified data update for deployment
 */
export async function POST(request: Request) {
  try {
    console.log('🚀 Starting data update...')
    
    // Get live ETH price from CoinGecko API
    let ethPrice = 3680.0 // fallback
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
      if (response.ok) {
        const data = await response.json()
        ethPrice = data.ethereum?.usd || ethPrice
        console.log('✅ Live ETH price fetched:', ethPrice)
      } else {
        console.log('⚠️ CoinGecko API failed, using fallback price')
      }
    } catch (error) {
      console.log('⚠️ ETH price fetch error, using fallback:', error)
    }
    
    // Stock price updates temporarily disabled for deployment
    const shouldUpdateStocks = new URL(request.url).searchParams.get('forceStockUpdate') === 'true'
    const stockUpdatesCount = 0
    
    if (shouldUpdateStocks) {
      console.log('📊 Stock price updates requested but temporarily disabled for deployment stability')
      // TODO: Re-enable stock price updates after schema sync
    }
    
    // Refresh company data after stock updates
    const updatedCompanies = await prisma.company.findMany({
      where: { isActive: true }
    })
    
    // Calculate basic metrics
    const totalEthHeld = updatedCompanies.reduce((sum, company) => 
      sum + (company.ethHoldings || 0), 0
    )
    
    const totalEthValue = totalEthHeld * ethPrice
    const totalMarketCap = updatedCompanies.reduce((sum, company) => 
      sum + Number(company.marketCap || 0), 0
    )
    
    // Update system metrics
    await prisma.systemMetrics.upsert({
      where: { id: 1 },
      update: {
        totalEthHoldings: totalEthHeld,
        totalCompanies: updatedCompanies.length,
        ethPrice: ethPrice,
        totalEthValue: totalEthValue,
        totalMarketCap: totalMarketCap,
        ethSupplyPercent: (totalEthHeld / 120500000) * 100,
        lastUpdate: new Date()
      },
      create: {
        totalEthHoldings: totalEthHeld,
        totalCompanies: updatedCompanies.length,
        ethPrice: ethPrice,
        totalEthValue: totalEthValue,
        totalMarketCap: totalMarketCap,
        ethSupplyPercent: (totalEthHeld / 120500000) * 100,
        lastUpdate: new Date()
      }
    })
    
    console.log('✅ Data update completed')
    
    return NextResponse.json({
      success: true,
      message: shouldUpdateStocks ? 
        `Data updated successfully. Stock prices updated for ${stockUpdatesCount} companies.` :
        'Data updated successfully',
      stats: {
        companiesUpdated: shouldUpdateStocks ? stockUpdatesCount : updatedCompanies.length,
        totalCompanies: updatedCompanies.length,
        ethPrice: ethPrice,
        totalEthHoldings: totalEthHeld,
        totalEthValue: totalEthValue,
        totalMarketCap: totalMarketCap,
        ethSupplyPercent: `${((totalEthHeld / 120500000) * 100).toFixed(4)}%`
      },
      companies: updatedCompanies.map(company => ({
        name: company.name,
        ticker: company.ticker,
        ethHoldings: company.ethHoldings,
        ethValue: (company.ethHoldings || 0) * ethPrice,
        marketCap: company.marketCap ? Number(company.marketCap) : null,
        lastUpdated: company.lastUpdated
      })),
      timestamp: new Date().toISOString()
    })
    
  } catch (error: unknown) {
    console.error('❌ Data update failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update data'
      },
      { status: 500 }
    )
  }
}
