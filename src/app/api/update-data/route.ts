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
    
    // Simple ETH price (hardcoded for now)
    const ethPrice = 3680.0
    
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
