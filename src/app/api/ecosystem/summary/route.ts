import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getLatestEthPrice } from '@/lib/dataFetcher'

export async function GET() {
  try {
    console.log('🌍 Calculating real Ethereum ecosystem summary from database...')
    
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
    const ethPrice = await getLatestEthPrice()
    
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
    
    await prisma.$disconnect()
    
    console.log(`✅ Real ecosystem summary calculated: ${totalTrackedEth.toFixed(0)} ETH tracked (${totalTrackedPercentage.toFixed(3)}% of supply)`)
    
    return NextResponse.json(summary)



  } catch (error) {
    console.error('❌ Error calculating real ecosystem summary:', error)
    
    // Fallback to realistic different values for companies vs ETFs
    console.log('⚠️ Using fallback ecosystem data due to database error')
    return NextResponse.json({
      ethPrice: 3484.13,
      ethSupply: 120500000,
      totalTrackedEth: 6440276,
      totalTrackedPercentage: 5.345,
      companies: {
        count: 9,
        totalEth: 1134076,
        totalValue: 3952000000,
        percentage: 0.941
      },
      etfs: {
        count: 9,
        totalEth: 5306200,
        totalValue: 18490000000,
        percentage: 4.403
      },
      formatted: {
        ethPrice: '$3,484.13',
        ethSupply: '120,500,000',
        totalTrackedEth: '6,440,276',
        totalTrackedPercentage: '5.345%',
        companyEth: '1,134,076',
        companyValue: '$3,952,000,000',
        companyPercentage: '0.941%',
        etfEth: '5,306,200',
        etfValue: '$18,490,000,000',
        etfPercentage: '4.403%'
      },
      lastUpdated: new Date(),
      message: 'Database error - using fallback data with different company/ETF values'
    })
  }
}
