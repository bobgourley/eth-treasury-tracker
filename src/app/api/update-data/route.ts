import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Company } from '@/types/company'
import { 
  updateCompanyEthHoldings, 
  getEthPrice, 
  getTotalEthSupply,
  checkApiHealth 
} from '@/lib/api'
import { updateMultipleStockData, checkStockApiHealth } from '@/lib/stock-api'

/**
 * POST /api/update-data
 * Manually trigger data update from external APIs
 * This will be used for testing and can be called by cron jobs
 */
export async function POST(request: Request) {
  try {
    console.log('Starting live data update...')
    
    // Check API health first
    const healthCheck = await checkApiHealth()
    console.log('API Health Check:', healthCheck)
    
    if (healthCheck.errors.length > 0) {
      console.warn('API health issues detected:', healthCheck.errors)
    }
    
    // Get current companies from database
    const companies = await prisma.company.findMany({
      where: { isActive: true }
    })
    
    console.log(`Found ${companies.length} active companies to update`)
    
    let updatedCount = 0
    
    // Get last saved ETH price from database as fallback (safer than hardcoded)
    const lastMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })
    let ethPrice = lastMetrics?.ethPrice || 3500 // Use last saved price, or conservative fallback
    let totalEthSupply = 120500000 // Default fallback supply
    
    // Update ETH price if CoinGecko is available
    if (healthCheck.coingecko) {
      try {
        ethPrice = await getEthPrice()
        console.log(`Updated ETH price: $${ethPrice}`)
      } catch (error) {
        console.error('Failed to update ETH price:', error)
      }
    }
    
    // Update total ETH supply if Etherscan is available
    if (healthCheck.etherscan) {
      try {
        totalEthSupply = await getTotalEthSupply()
        console.log(`Updated total ETH supply: ${totalEthSupply}`)
      } catch (error) {
        console.error('Failed to update ETH supply:', error)
      }
    }
    
    // Skip automatic ETH holdings updates for MVP - use manual admin updates instead
    // This is safer and more accurate since real company treasury addresses are:
    // 1. Hard to find publicly
    // 2. Change frequently 
    // 3. Often use multiple addresses or cold storage
    // 4. Require manual verification for accuracy
    console.log('Skipping automatic ETH holdings update - using manual admin values')
    
    // Update stock data for companies with tickers (with rate limiting)
    const stockApiHealthy = await checkStockApiHealth()
    console.log('Stock API Health:', stockApiHealthy)
    
    if (stockApiHealthy) {
      try {
        // Check if stock data was updated in the last 24 hours
        const currentMetrics = await prisma.systemMetrics.findFirst({
          orderBy: { lastUpdate: 'desc' }
        })
        
        const now = new Date()
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        const url = new URL(request.url)
        const forceStockUpdate = url.searchParams.get('forceStockUpdate') === 'true'
        
        const shouldUpdateStock = forceStockUpdate || 
          !currentMetrics?.lastStockUpdate || 
          currentMetrics.lastStockUpdate < twentyFourHoursAgo
        
        if (shouldUpdateStock) {
          const companiesWithTickers = companies.filter(company => company.ticker)
          const tickers = companiesWithTickers.map(company => company.ticker!)
          
          if (tickers.length > 0) {
            console.log(`Updating stock data for ${tickers.length} companies... ${forceStockUpdate ? '(FORCED)' : '(24h elapsed)'}`)
            const stockDataMap = await updateMultipleStockData(tickers)
            
            // Update companies with stock data
            for (const company of companiesWithTickers) {
              const stockData = stockDataMap.get(company.ticker!)
              if (stockData) {
                await prisma.company.update({
                  where: { id: company.id },
                  data: {
                    stockPrice: stockData.quote.price,
                    marketCap: BigInt(stockData.overview.marketCap || 0),
                    sharesOutstanding: BigInt(stockData.overview.sharesOutstanding || 0),
                    lastUpdated: new Date()
                  }
                })
                updatedCount++
                console.log(`Updated stock data for ${company.ticker}: $${stockData.quote.price}`)
              }
            }
            
            // Update the last stock update timestamp
            await prisma.systemMetrics.updateMany({
              data: {
                lastStockUpdate: now
              }
            })
          }
        } else {
          console.log('Stock data was updated within the last 24 hours - skipping stock update')
        }
      } catch (error) {
        console.error('Failed to update stock data:', error)
      }
    } else {
      console.log('Stock API not available - skipping stock data update')
    }
    
    // Calculate and update system metrics
    const totalEthHoldings = companies.reduce((sum: number, company: any) => 
      sum + (company.ethHoldings || 0), 0
    )
    
    const totalEthValue = totalEthHoldings * ethPrice
    const totalMarketCap = companies.reduce((sum: number, company: any) => 
      sum + Number(company.marketCap || 0), 0
    )
    const ethSupplyPercent = (totalEthHoldings / totalEthSupply) * 100
    
    // Update system metrics
    await prisma.systemMetrics.upsert({
      where: { id: 1 },
      update: {
        totalEthHoldings,
        totalCompanies: companies.length,
        ethPrice,
        totalEthValue,
        totalMarketCap,
        ethSupplyPercent,
        lastUpdate: new Date()
      },
      create: {
        id: 1,
        totalEthHoldings,
        totalCompanies: companies.length,
        ethPrice,
        totalEthValue,
        totalMarketCap,
        ethSupplyPercent
      }
    })
    
    const response = {
      success: true,
      message: 'Data update completed',
      stats: {
        companiesUpdated: updatedCount,
        totalCompanies: companies.length,
        ethPrice,
        totalEthHoldings,
        totalEthValue,
        ethSupplyPercent: ethSupplyPercent.toFixed(3) + '%'
      },
      apiHealth: healthCheck,
      timestamp: new Date().toISOString()
    }
    
    console.log('Data update completed:', response.stats)
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Data update failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update data',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * GET /api/update-data
 * Get status of last data update and API health
 */
export async function GET() {
  try {
    // Get latest system metrics
    const metrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })
    
    // Check API health
    const healthCheck = await checkApiHealth()
    
    return NextResponse.json({
      lastUpdate: metrics?.lastUpdate || null,
      apiHealth: healthCheck,
      metrics: metrics ? {
        totalEthHoldings: metrics.totalEthHoldings,
        totalCompanies: metrics.totalCompanies,
        ethPrice: metrics.ethPrice,
        totalEthValue: metrics.totalEthValue,
        ethSupplyPercent: metrics.ethSupplyPercent
      } : null,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Failed to get update status:', error)
    
    return NextResponse.json({
      error: 'Failed to get update status',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
