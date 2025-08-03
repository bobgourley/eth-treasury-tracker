import { NextResponse } from 'next/server'
import { updateSystemMetrics } from '@/lib/dataFetcher'

export async function POST() {
  try {
    console.log('🔄 Admin request to update system metrics...')
    
    await updateSystemMetrics()
    
    return NextResponse.json({
      success: true,
      message: 'System metrics updated successfully with live API data',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error in update-metrics endpoint:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update system metrics',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Allow GET requests for testing
export async function GET() {
  return NextResponse.json({
    message: 'Use POST to update system metrics with live API data',
    endpoint: '/api/admin/update-metrics',
    method: 'POST'
  })
}
