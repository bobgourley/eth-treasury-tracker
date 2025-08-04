import { NextResponse } from 'next/server'
import { fetchStaticEcosystemData, fetchStaticETFsData } from '../../../../lib/staticDataFetcher'

export async function GET() {
  try {
    console.log('🔍 Testing static data functions...')
    
    // Test both static data functions
    const [ecosystemData, etfsData] = await Promise.all([
      fetchStaticEcosystemData(),
      fetchStaticETFsData()
    ])
    
    console.log('📊 Ecosystem ETF data:', {
      count: ecosystemData.etfs.count,
      totalEth: ecosystemData.etfs.totalEth,
      totalValue: ecosystemData.etfs.totalValue
    })
    
    console.log('📈 ETFs data:', {
      count: etfsData.count,
      etfsLength: etfsData.etfs.length,
      message: etfsData.message
    })
    
    return NextResponse.json({
      success: true,
      ecosystem: {
        etfs: ecosystemData.etfs
      },
      etfsData: {
        count: etfsData.count,
        etfsLength: etfsData.etfs.length,
        message: etfsData.message,
        firstEtf: etfsData.etfs[0] || null
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error: unknown) {
    console.error('❌ Static data test failed:', error)
    return NextResponse.json({
      error: 'Static data test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
