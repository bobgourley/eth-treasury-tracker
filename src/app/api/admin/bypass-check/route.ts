import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const bypassCookie = cookieStore.get('admin-bypass')
    
    if (!bypassCookie) {
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }

    try {
      const bypassData = JSON.parse(bypassCookie.value)
      
      // Check if bypass session is still valid (24 hours)
      const now = Date.now()
      if (now > bypassData.expires) {
        return NextResponse.json({ isAdmin: false }, { status: 200 })
      }

      return NextResponse.json({ 
        isAdmin: true, 
        email: bypassData.email,
        method: 'bypass'
      }, { status: 200 })
    } catch (parseError) {
      console.error('Failed to parse bypass cookie:', parseError)
      return NextResponse.json({ isAdmin: false }, { status: 200 })
    }
  } catch (error) {
    console.error('Bypass check error:', error)
    return NextResponse.json({ isAdmin: false }, { status: 200 })
  }
}
