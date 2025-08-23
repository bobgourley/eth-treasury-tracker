import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const bypassCookie = cookieStore.get('admin-bypass')
    
    const result = {
      hasBypassCookie: !!bypassCookie,
      cookieValue: bypassCookie?.value || null,
      adminEmail: process.env.ADMIN_EMAIL || 'NOT_SET',
      bypassSecret: process.env.ADMIN_BYPASS_SECRET || 'temp-admin-bypass-2025',
      allCookies: Object.fromEntries(
        Array.from(cookieStore.getAll()).map(cookie => [cookie.name, cookie.value])
      )
    }
    
    if (bypassCookie) {
      try {
        const parsed = JSON.parse(bypassCookie.value)
        result.parsedCookie = parsed
        result.isExpired = Date.now() > parsed.expires
      } catch (e) {
        result.parseError = 'Failed to parse cookie'
      }
    }
    
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}
