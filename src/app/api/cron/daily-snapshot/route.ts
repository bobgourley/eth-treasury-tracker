import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🕐 Daily snapshot cron job triggered')
    
    // Verify this is a legitimate cron request
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('🚫 Unauthorized cron request')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Call the daily snapshot API
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const snapshotResponse = await fetch(`${baseUrl}/api/snapshots/daily`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const snapshotData = await snapshotResponse.json()
    
    if (!snapshotResponse.ok) {
      throw new Error(`Snapshot API failed: ${snapshotData.error}`)
    }
    
    console.log('✅ Daily snapshot cron job completed successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Daily snapshot cron job completed',
      timestamp: new Date().toISOString(),
      snapshotData
    })
    
  } catch (error) {
    console.error('❌ Daily snapshot cron job failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Daily snapshot cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Also support POST for manual triggering
export async function POST(request: NextRequest) {
  return GET(request)
}
