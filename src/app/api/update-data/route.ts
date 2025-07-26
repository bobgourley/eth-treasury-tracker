import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * POST /api/update-data
 * Simplified data update for deployment
 */
export async function POST() {
  try {
    console.log('🚀 Starting data update...')
    
    // Get all active companies
    const companies = await prisma.company.findMany({
      where: { isActive: true }
    })
    
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
    
    // Calculate basic metrics
    const totalEthHeld = companies.reduce((sum, company) => 
      sum + (company.ethHoldings || 0), 0
    )
    
    const totalEthValue = totalEthHeld * ethPrice
    const totalMarketCap = companies.reduce((sum, company) => 
      sum + Number(company.marketCap || 0), 0
    )
    
    // Update system metrics
    await prisma.systemMetrics.upsert({
      where: { id: 1 },
      update: {
        totalEthHoldings: totalEthHeld,
        totalCompanies: companies.length,
        ethPrice: ethPrice,
        totalEthValue: totalEthValue,
        totalMarketCap: totalMarketCap,
        ethSupplyPercent: (totalEthHeld / 120500000) * 100,
        lastUpdate: new Date()
      },
      create: {
        totalEthHoldings: totalEthHeld,
        totalCompanies: companies.length,
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
      message: 'Data updated successfully',
      data: {
        ethPrice,
        totalEthHeld,
        totalEthValue,
        totalMarketCap,
        companiesCount: companies.length
      }
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
