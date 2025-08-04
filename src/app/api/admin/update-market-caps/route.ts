import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getStockPrice } from '@/lib/api'

export async function POST() {
  try {
    const prisma = new PrismaClient()
    
    // Get all active companies
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        ticker: true,
        name: true,
        marketCap: true,
        stockPrice: true,
        lastUpdated: true
      }
    })

    console.log(`\n=== MARKET CAP UPDATE PROCESS ===`)
    console.log(`Updating market cap data for ${companies.length} companies`)
    
    const results = []
    let successCount = 0
    let rateLimitCount = 0
    let errorCount = 0

    for (const company of companies) {
      if (!company.ticker) {
        console.log(`⚠️ Skipping ${company.name} - no ticker symbol`)
        continue
      }

      console.log(`\n📊 Processing ${company.ticker} (${company.name})...`)
      
      try {
        // Attempt to fetch live data from Alpha Vantage
        const stockData = await getStockPrice(company.ticker)
        
        if (stockData && stockData.marketCap > 0) {
          // Successfully got live data - update database
          await prisma.company.update({
            where: { id: company.id },
            data: {
              marketCap: BigInt(Math.round(stockData.marketCap)),
              stockPrice: stockData.price,
              lastUpdated: new Date()
            }
          })
          
          console.log(`✅ Updated ${company.ticker}: MarketCap=$${stockData.marketCap.toLocaleString()}, Price=$${stockData.price}`)
          
          results.push({
            ticker: company.ticker,
            name: company.name,
            status: 'updated',
            marketCap: stockData.marketCap,
            stockPrice: stockData.price,
            source: 'alpha_vantage_live'
          })
          
          successCount++
          
          // Add small delay between API calls to be respectful (Alpha Vantage free tier: 25 calls/day)
          await new Promise(resolve => setTimeout(resolve, 1000)) // 1 second delay between calls
          
        } else {
          // API call failed or rate limited - use last known database value
          const lastKnownMarketCap = company.marketCap ? Number(company.marketCap) : 0
          
          console.log(`🔄 ${company.ticker}: API unavailable, using last known MarketCap=$${lastKnownMarketCap.toLocaleString()}`)
          
          results.push({
            ticker: company.ticker,
            name: company.name,
            status: 'fallback',
            marketCap: lastKnownMarketCap,
            stockPrice: company.stockPrice || 0,
            source: 'database_fallback',
            lastUpdated: company.lastUpdated
          })
          
          rateLimitCount++
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${company.ticker}:`, error)
        
        // Use last known database value on error
        const lastKnownMarketCap = company.marketCap ? Number(company.marketCap) : 0
        
        results.push({
          ticker: company.ticker,
          name: company.name,
          status: 'error',
          marketCap: lastKnownMarketCap,
          stockPrice: company.stockPrice || 0,
          source: 'database_fallback',
          error: error instanceof Error ? error.message : 'Unknown error',
          lastUpdated: company.lastUpdated
        })
        
        errorCount++
      }
    }

    await prisma.$disconnect()

    console.log(`\n=== UPDATE SUMMARY ===`)
    console.log(`✅ Successfully updated: ${successCount}`)
    console.log(`🔄 Rate limited/fallback: ${rateLimitCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    console.log(`📊 Total processed: ${results.length}`)
    console.log(`========================\n`)

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed: results.length,
        successfulUpdates: successCount,
        rateLimitedFallbacks: rateLimitCount,
        errors: errorCount
      },
      results,
      message: `Market cap update completed. ${successCount} companies updated with live data, ${rateLimitCount + errorCount} using database fallback.`
    })

  } catch (error) {
    console.error('Market cap update process failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Market cap update process failed'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const prisma = new PrismaClient()
    
    // Get current market cap status for all companies
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        id: true,
        ticker: true,
        name: true,
        marketCap: true,
        stockPrice: true,
        lastUpdated: true
      },
      orderBy: { marketCap: 'desc' }
    })

    await prisma.$disconnect()

    const companiesWithStatus = companies.map(company => ({
      ticker: company.ticker,
      name: company.name,
      marketCap: company.marketCap ? Number(company.marketCap) : 0,
      marketCapFormatted: company.marketCap ? `$${Number(company.marketCap).toLocaleString()}` : '$0',
      stockPrice: company.stockPrice || 0,
      lastUpdated: company.lastUpdated,
      dataAge: company.lastUpdated ? 
        Math.floor((Date.now() - company.lastUpdated.getTime()) / (1000 * 60 * 60)) : null, // hours
      needsUpdate: company.lastUpdated ? 
        (Date.now() - company.lastUpdated.getTime()) > (24 * 60 * 60 * 1000) : true // older than 24 hours
    }))

    const summary = {
      totalCompanies: companies.length,
      companiesWithData: companies.filter(c => c.marketCap && Number(c.marketCap) > 0).length,
      companiesNeedingUpdate: companiesWithStatus.filter(c => c.needsUpdate).length,
      totalMarketCap: companies.reduce((sum, c) => sum + (c.marketCap ? Number(c.marketCap) : 0), 0),
      lastUpdateTimes: {
        newest: companies.reduce((newest, c) => 
          c.lastUpdated && (!newest || c.lastUpdated > newest) ? c.lastUpdated : newest, null as Date | null),
        oldest: companies.reduce((oldest, c) => 
          c.lastUpdated && (!oldest || c.lastUpdated < oldest) ? c.lastUpdated : oldest, null as Date | null)
      }
    }

    return NextResponse.json({
      success: true,
      summary,
      companies: companiesWithStatus,
      message: `Market cap status retrieved for ${companies.length} companies`
    })

  } catch (error) {
    console.error('Failed to get market cap status:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}
