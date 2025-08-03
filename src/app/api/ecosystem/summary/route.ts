import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('🌍 Fetching Ethereum ecosystem summary from database...')
    
    // TODO: Fix Prisma ecosystemSummary model recognition issue
    // Temporarily using fallback data until database integration is fixed
    console.log('📊 Using corrected fallback ecosystem data with different company/ETF values')
    
    return NextResponse.json({
      ethPrice: 3825.95,
      ethSupply: 120500000,
      totalTrackedEth: 5000000,
      totalTrackedPercentage: 4.15,
      companies: {
        count: 9,
        totalEth: 1200000,
        totalValue: 4590000000,
        percentage: 0.996
      },
      etfs: {
        count: 9,
        totalEth: 3800000,
        totalValue: 14535000000,
        percentage: 3.154
      },
      formatted: {
        ethPrice: '$3,825.95',
        ethSupply: '120,500,000',
        totalTrackedEth: '5,000,000',
        totalTrackedPercentage: '4.150%',
        companyEth: '1,200,000',
        companyValue: '$4,590,000,000',
        companyPercentage: '0.996%',
        etfEth: '3,800,000',
        etfValue: '$14,535,000,000',
        etfPercentage: '3.154%'
      },
      lastUpdated: new Date(),
      message: 'Using corrected fallback ecosystem data with different company/ETF values'
    })



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
        totalEth: 1200000,
        totalValue: 4590000000,
        percentage: 0.996
      },
      etfs: {
        count: 9,
        totalEth: 3800000,
        totalValue: 14535000000,
        percentage: 3.154
      },
      formatted: {
        ethPrice: '$3,825.95',
        ethSupply: '120,500,000',
        totalTrackedEth: '5,000,000',
        totalTrackedPercentage: '4.150%',
        companyEth: '1,200,000',
        companyValue: '$4,590,000,000',
        companyPercentage: '0.996%',
        etfEth: '3,800,000',
        etfValue: '$14,535,000,000',
        etfPercentage: '3.154%'
      },
      lastUpdated: new Date(),
      message: 'Using fallback ecosystem data'
    })
  }
}
