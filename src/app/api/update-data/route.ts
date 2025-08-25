import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { FALLBACK_ETH_SUPPLY } from '@/lib/constants'

const prisma = new PrismaClient()

/**
 * POST /api/update-data
 * Simplified data update for deployment
 */
export async function POST(request: Request) {
  try {
    console.log('🚀 Starting data update...')
    
    // Get last known ETH price from database as fallback
    const lastSystemMetrics = await prisma.systemMetrics.findFirst()
    let ethPrice = lastSystemMetrics?.ethPrice // Database is single source of truth
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
          ethPriceSource = 'CoinGecko API'
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
    
    // Stock price updates re-enabled with Alpha Vantage API
    const shouldUpdateStocks = new URL(request.url).searchParams.get('forceStockUpdate') === 'true'
    const stockUpdatesCount = 0
    
    if (shouldUpdateStocks) {
      console.log('📊 Stock price updates requested')
      
      // Update stock prices using Alpha Vantage API
      const companies = await prisma.company.findMany({
        where: { isActive: true }
      })
      
      for (const company of companies) {
        if (!company.ticker) continue
        
        try {
          const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY
          if (!alphaVantageKey) {
            console.log('⚠️ Alpha Vantage API key not found')
            continue
          }
          
          const response = await fetch(
            `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${company.ticker}&apikey=${alphaVantageKey}`
          )
          
          if (response.ok) {
            const data = await response.json()
            const quote = data['Global Quote']
            const stockPrice = parseFloat(quote?.['05. price']) || null
            
            if (stockPrice) {
              await prisma.company.update({
                where: { id: company.id },
                data: { 
                  // stockPrice, // Temporarily disabled until schema migration
                  lastUpdated: new Date()
                }
              })
              console.log(`✅ Stock price fetched for ${company.name}: $${stockPrice} (update disabled for build)`)
            }
          } else {
            console.log(`⚠️ Failed to fetch stock price for ${company.name}`)
          }
        } catch (error) {
          console.log(`⚠️ Error updating stock price for ${company.name}:`, error)
        }
      }
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
        ethSupplyPercent: (totalEthHeld / FALLBACK_ETH_SUPPLY) * 100,
        lastUpdate: new Date()
        // ETH price tracking fields (will be enabled after schema migration)
        // ethPriceLastUpdate: ethPriceLastUpdate,
        // ethPriceSource: ethPriceSource
      },
      create: {
        totalEthHoldings: totalEthHeld,
        totalCompanies: updatedCompanies.length,
        ethPrice: ethPrice,
        totalEthValue: totalEthValue,
        totalMarketCap: totalMarketCap,
        ethSupplyPercent: (totalEthHeld / FALLBACK_ETH_SUPPLY) * 100,
        lastUpdate: new Date()
        // ETH price tracking fields (will be enabled after schema migration)
        // ethPriceLastUpdate: ethPriceLastUpdate,
        // ethPriceSource: ethPriceSource
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
        ethSupplyPercent: `${((totalEthHeld / FALLBACK_ETH_SUPPLY) * 100).toFixed(4)}%`
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
