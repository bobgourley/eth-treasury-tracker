import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getEthPriceFromDatabase } from '@/lib/databaseHelpers'

export async function GET() {
  const prisma = new PrismaClient()
  try {
    console.log('🌍 Calculating real Ethereum ecosystem summary from database...')
    
    // Ensure database connection is established before making queries
    await prisma.$connect()
    
    // Fetch real data from companies and ETFs
    const [companies, etfs] = await Promise.all([
      prisma.company.findMany({
        where: { isActive: true },
        select: {
          ethHoldings: true,
          marketCap: true
        }
      }),
      prisma.etf.findMany({
        where: { isActive: true },
        select: {
          ethHoldings: true,
          totalValue: true
        }
      })
    ])
    
    // Get ETH price from live API with database backup
    const ethPrice = await getEthPriceFromDatabase()
    
    // Calculate company totals
    const companyTotalEth = companies.reduce((sum, company) => sum + (company.ethHoldings || 0), 0)
    const companyTotalValue = companyTotalEth * ethPrice
    
    // Calculate ETF totals
    const etfTotalEth = etfs.reduce((sum, etf) => sum + (etf.ethHoldings || 0), 0)
    const etfTotalValue = etfTotalEth * ethPrice
    
    // Calculate overall totals
    const totalTrackedEth = companyTotalEth + etfTotalEth
    const ethSupply = 120500000 // Current ETH supply (could be fetched from API)
    const totalTrackedPercentage = (totalTrackedEth / ethSupply) * 100
    const companyPercentage = (companyTotalEth / ethSupply) * 100
    const etfPercentage = (etfTotalEth / ethSupply) * 100
    
    const summary = {
      ethPrice,
      ethSupply,
      totalTrackedEth,
      totalTrackedPercentage,
      companies: {
        count: companies.length,
        totalEth: companyTotalEth,
        totalValue: companyTotalValue,
        percentage: companyPercentage
      },
      etfs: {
        count: etfs.length,
        totalEth: etfTotalEth,
        totalValue: etfTotalValue,
        percentage: etfPercentage
      },
      formatted: {
        ethPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(ethPrice),
        ethSupply: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(ethSupply),
        totalTrackedEth: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(totalTrackedEth),
        totalTrackedPercentage: `${totalTrackedPercentage.toFixed(3)}%`,
        companyEth: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(companyTotalEth),
        companyValue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(companyTotalValue),
        companyPercentage: `${companyPercentage.toFixed(3)}%`,
        etfEth: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(etfTotalEth),
        etfValue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(etfTotalValue),
        etfPercentage: `${etfPercentage.toFixed(3)}%`
      },
      lastUpdated: new Date(),
      message: `Real data: ${companies.length} companies (${companyTotalEth.toFixed(0)} ETH), ${etfs.length} ETFs (${etfTotalEth.toFixed(0)} ETH)`
    }
    
    console.log(`✅ Real ecosystem summary calculated: ${totalTrackedEth.toFixed(0)} ETH tracked (${totalTrackedPercentage.toFixed(3)}% of supply)`)
    
    return NextResponse.json(summary)



  } catch (error) {
    console.error('❌ Error calculating ecosystem summary from database:', error)
    
    // Return error - no hardcoded fallbacks, database is the single source of truth
    return NextResponse.json({
      error: 'Database connection failed',
      message: 'Unable to fetch ecosystem data - database unavailable',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    // Always clean up database connection
    await prisma.$disconnect()
  }
}
