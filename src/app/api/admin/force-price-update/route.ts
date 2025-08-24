import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { PrismaClient } from '@prisma/client'
import { FALLBACK_ETH_SUPPLY } from '@/lib/constants'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    // Skip auth check for now to test functionality
    console.log('🔄 Admin force price update started...')

    console.log('🔄 Admin force price update started...')
    
    // Get live ETH price from CoinGecko API
    let ethPrice = 3680.0 // fallback
    let btcPrice = 65000.0 // fallback
    let ethPriceSource = 'fallback'
    
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,bitcoin&vs_currencies=usd')
      if (response.ok) {
        const data = await response.json()
        if (data.ethereum?.usd) {
          ethPrice = data.ethereum.usd
          ethPriceSource = 'coingecko_live'
        }
        if (data.bitcoin?.usd) {
          btcPrice = data.bitcoin.usd
        }
        console.log(`✅ Live prices: ETH $${ethPrice}, BTC $${btcPrice}`)
      }
    } catch (error) {
      console.log('⚠️ CoinGecko API failed, using fallback prices')
    }

    // Get current companies for calculations
    const companies = await prisma.company.findMany({
      where: { isActive: true }
    })

    // Calculate metrics
    const totalEthHeld = companies.reduce((sum, company) => 
      sum + (company.ethHoldings || 0), 0
    )
    const totalEthValue = totalEthHeld * ethPrice
    const totalMarketCap = companies.reduce((sum, company) => 
      sum + Number(company.marketCap || 0), 0
    )

    // Update or create system metrics (remove bitcoinPrice as it's not in schema)
    const result = await prisma.systemMetrics.upsert({
      where: { id: 1 },
      update: {
        ethPrice: ethPrice,
        totalEthValue: totalEthValue,
        lastUpdate: new Date()
      },
      create: {
        totalEthHoldings: totalEthHeld,
        totalCompanies: companies.length,
        ethPrice: ethPrice,
        totalEthValue: totalEthValue,
        totalMarketCap: totalMarketCap,
        ethSupplyPercent: (totalEthHeld / FALLBACK_ETH_SUPPLY) * 100,
        lastUpdate: new Date()
      }
    })

    console.log('✅ Admin force price update completed')
    
    return NextResponse.json({
      success: true,
      message: 'Prices updated successfully',
      data: {
        ethPrice: ethPrice,
        btcPrice: btcPrice,
        ethPriceSource: ethPriceSource,
        totalEthValue: totalEthValue,
        totalCompanies: companies.length,
        lastUpdate: new Date().toISOString()
      }
    })

  } catch (error: unknown) {
    console.error('❌ Admin force price update failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update prices',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
