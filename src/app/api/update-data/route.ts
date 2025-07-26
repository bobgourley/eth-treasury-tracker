import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Company } from '@/types/company'
import { 
  updateCompanyEthHoldings, 
  getEthPrice, 
  getTotalEthSupply,
  checkApiHealth 
} from '@/lib/api'

/**
 * POST /api/update-data
 * Manually trigger data update from external APIs
 * This will be used for testing and can be called by cron jobs
 */
export async function POST() {
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
    let ethPrice = 3680 // Default fallback price
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
    
    // Update company ETH holdings if we have API access
    if (healthCheck.etherscan) {
      try {
        const updatedCompanies = await updateCompanyEthHoldings(companies)
        
        // Save updated data to database
        for (const company of updatedCompanies) {
          await prisma.company.update({
            where: { id: company.id },
            data: {
              ethHoldings: company.ethHoldings,
              lastUpdated: new Date()
            }
          })
          updatedCount++
        }
        
        console.log(`Successfully updated ${updatedCount} companies`)
      } catch (error) {
        console.error('Failed to update company holdings:', error)
      }
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
