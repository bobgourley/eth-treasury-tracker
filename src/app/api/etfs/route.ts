import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getEthPriceFromDatabase } from '@/lib/databaseHelpers'

// Realistic ETF data estimates
const ETF_DATA = {
  'ETHA': { name: 'iShares Ethereum Trust ETF', estimatedEthHoldings: 2730000, estimatedAum: 10490000000, expenseRatio: 0.25 }, // $10.49B AUM
  'ETHE': { name: 'Grayscale Ethereum Trust', estimatedEthHoldings: 1108000, estimatedAum: 4260000000, expenseRatio: 2.5 }, // $4.26B AUM
  'ETH': { name: 'Grayscale Ethereum Mini Trust', estimatedEthHoldings: 642000, estimatedAum: 2470000000, expenseRatio: 0.25 }, // $2.47B AUM
  'FETH': { name: 'Fidelity Ethereum Fund', estimatedEthHoldings: 598000, estimatedAum: 2300000000, expenseRatio: 0.25 }, // $2.30B AUM
  'ETHW': { name: 'Bitwise Ethereum ETF', estimatedEthHoldings: 132000, estimatedAum: 507130000, expenseRatio: 0.25 }, // $507.13M AUM
  'ETHV': { name: 'VanEck Ethereum ETF', estimatedEthHoldings: 55200, estimatedAum: 212340000, expenseRatio: 0.75 }, // $212.34M AUM
  'EZET': { name: 'Franklin Ethereum ETF', estimatedEthHoldings: 19600, estimatedAum: 75290000, expenseRatio: 0.30 }, // $75.29M AUM
  'CETH': { name: '21Shares Core Ethereum ETF', estimatedEthHoldings: 11500, estimatedAum: 44290000, expenseRatio: 0.20 }, // $44.29M AUM
  'QETH': { name: 'Invesco Galaxy Ethereum ETF', estimatedEthHoldings: 9900, estimatedAum: 38150000, expenseRatio: 0.40 } // $38.15M AUM
}

const ETF_SYMBOLS = Object.keys(ETF_DATA)

// Helper function to get estimated expense ratio
function getEstimatedExpenseRatio(symbol: string): number {
  const etfInfo = ETF_DATA[symbol as keyof typeof ETF_DATA]
  return etfInfo ? etfInfo.expenseRatio : 0.75
}

// Helper function to get fallback ETF data
async function getFallbackEtfData() {
  // Get ETH price from database to ensure consistency with other APIs
  const ethPrice = await getEthPriceFromDatabase()
  
  const fallbackEtfs = ETF_SYMBOLS.map((symbol, index) => {
    const etfInfo = ETF_DATA[symbol as keyof typeof ETF_DATA]
    const variation = 0.95 + (Math.random() * 0.1) // 95% to 105%
    const ethHoldings = etfInfo.estimatedEthHoldings * variation
    const aum = etfInfo.estimatedAum * variation
    const totalValue = ethHoldings * ethPrice
    
    return {
      id: index + 1,
      symbol,
      name: etfInfo.name,
      ethHoldings,
      totalValue,
      aum,
      expenseRatio: etfInfo.expenseRatio,
      nav: aum > 0 ? (aum / 1000000) : 100,
      lastUpdated: new Date(),
      createdAt: new Date(),
      isActive: true
    }
  })
  
  fallbackEtfs.sort((a, b) => b.ethHoldings - a.ethHoldings)
  
  return NextResponse.json({
    etfs: fallbackEtfs,
    count: fallbackEtfs.length,
    ethPrice,
    message: 'Using fallback ETF data - FMP API key not available'
  })
}

export async function GET() {
  const prisma = new PrismaClient()
  try {
    console.log('📈 Fetching ETF data from database...')
    
    // Ensure database connection is established
    await prisma.$connect()
    
    // Fetch ETFs from database
    const etfs = await prisma.etf.findMany({
      where: { isActive: true },
      orderBy: { aum: 'desc' }
    })

    // If database is empty, use fallback data
    if (!etfs || etfs.length === 0) {
      console.log('⚠️ No ETFs in database - using fallback data')
      return await getFallbackEtfData()
    }

    // Get ETH price from database for consistency
    const ethPrice = await getEthPriceFromDatabase()

    // Convert BigInt to string for JSON serialization and add calculated values
    const serializedEtfs = etfs.map((etf) => ({
      ...etf,
      aum: etf.aum?.toString(),
      totalValue: (etf.ethHoldings || 0) * ethPrice, // Recalculate with current ETH price
      lastUpdated: etf.lastUpdated.toISOString(),
      createdAt: etf.createdAt.toISOString(),
    }))

    console.log(`✅ Fetched ${serializedEtfs.length} ETFs from database`)

    return NextResponse.json({
      etfs: serializedEtfs,
      count: serializedEtfs.length,
      ethPrice,
      message: 'ETF data from database'
    })
    
  } catch (error) {
    console.error('❌ Database error, using fallback ETF data:', error)
    return await getFallbackEtfData()
  } finally {
    // Always clean up database connection
    await prisma.$disconnect()
  }
}
