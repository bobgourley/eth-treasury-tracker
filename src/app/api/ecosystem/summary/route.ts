import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('🌍 Fetching Ethereum ecosystem summary from database...')
    
    // Fetch ecosystem summary from database
    const ecosystemSummary = await prisma.ecosystemSummary.findFirst({
      orderBy: { lastUpdated: 'desc' }
    })

    if (!ecosystemSummary) {
      // Fallback if no data in database
      console.log('⚠️ No ecosystem summary in database, using fallback')
      return NextResponse.json({
        ethPrice: 3825.95,
        ethSupply: 120500000,
        totalTrackedEth: 5000000,
        totalTrackedPercentage: 4.15,
        companies: {
          count: 7,
          totalEth: 2500000,
          totalValue: 9500000000,
          percentage: 2.07
        },
        etfs: {
          count: 9,
          totalEth: 2500000,
          totalValue: 9500000000,
          percentage: 2.07
        },
        formatted: {
          ethPrice: '$3,825.95',
          ethSupply: '120,500,000',
          totalTrackedEth: '5,000,000',
          totalTrackedPercentage: '4.150%',
          companyEth: '2,500,000',
          companyValue: '$9,500,000,000',
          companyPercentage: '2.070%',
          etfEth: '2,500,000',
          etfValue: '$9,500,000,000',
          etfPercentage: '2.070%'
        },
        lastUpdated: new Date(),
        message: 'Using fallback ecosystem data - no database data available'
      })
    }

    // Format the data from database
    const summary = {
      ethPrice: ecosystemSummary.ethPrice,
      ethSupply: ecosystemSummary.ethSupply,
      totalTrackedEth: ecosystemSummary.totalTrackedEth,
      totalTrackedPercentage: ecosystemSummary.totalTrackedPercentage,
      companies: {
        count: ecosystemSummary.companyCount,
        totalEth: ecosystemSummary.companyTotalEth,
        totalValue: ecosystemSummary.companyTotalValue,
        percentage: ecosystemSummary.companyPercentage
      },
      etfs: {
        count: ecosystemSummary.etfCount,
        totalEth: ecosystemSummary.etfTotalEth,
        totalValue: ecosystemSummary.etfTotalValue,
        percentage: ecosystemSummary.etfPercentage
      },
      formatted: {
        ethPrice: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(ecosystemSummary.ethPrice),
        ethSupply: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(ecosystemSummary.ethSupply),
        totalTrackedEth: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(ecosystemSummary.totalTrackedEth),
        totalTrackedPercentage: `${ecosystemSummary.totalTrackedPercentage.toFixed(3)}%`,
        companyEth: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(ecosystemSummary.companyTotalEth),
        companyValue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(ecosystemSummary.companyTotalValue),
        companyPercentage: `${ecosystemSummary.companyPercentage.toFixed(3)}%`,
        etfEth: new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(ecosystemSummary.etfTotalEth),
        etfValue: new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(ecosystemSummary.etfTotalValue),
        etfPercentage: `${ecosystemSummary.etfPercentage.toFixed(3)}%`
      },
      lastUpdated: ecosystemSummary.lastUpdated
    }

    console.log(`✅ Ecosystem summary from database: ${ecosystemSummary.companyCount} companies, ${ecosystemSummary.etfCount} ETFs, ${ecosystemSummary.totalTrackedPercentage.toFixed(3)}% of ETH supply tracked`)

    return NextResponse.json(summary)

  } catch (error) {
    console.error('❌ Error fetching ecosystem summary:', error)
    
    // Fallback summary
    return NextResponse.json({
      ethPrice: 3825.95,
      ethSupply: 120500000,
      totalTrackedEth: 5000000,
      totalTrackedPercentage: 4.15,
      companies: {
        count: 9,
        totalEth: 2500000,
        totalValue: 9500000000,
        percentage: 2.07
      },
      etfs: {
        count: 9,
        totalEth: 2500000,
        totalValue: 9500000000,
        percentage: 2.07
      },
      formatted: {
        ethPrice: '$3,825.95',
        ethSupply: '120,500,000',
        totalTrackedEth: '5,000,000',
        totalTrackedPercentage: '4.150%',
        companyEth: '2,500,000',
        companyValue: '$9,500,000,000',
        companyPercentage: '2.070%',
        etfEth: '2,500,000',
        etfValue: '$9,500,000,000',
        etfPercentage: '2.070%'
      },
      lastUpdated: new Date(),
      message: 'Using fallback ecosystem data'
    })
  }
}
