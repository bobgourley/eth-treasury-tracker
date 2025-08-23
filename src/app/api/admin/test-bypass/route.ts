import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const bypassCookie = cookieStore.get('admin-bypass')
    
    interface TestResult {
      hasBypassCookie: boolean
      cookieValue: string | null
      adminEmail: string
      bypassSecret: string
      allCookies: Record<string, string>
      parsedCookie?: unknown
      isExpired?: boolean
      parseError?: string
    }

    const result: TestResult = {
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
        result.isExpired = Date.now() > (parsed as { expires: number }).expires
      } catch {
        result.parseError = 'Failed to parse cookie'
      }
    }
    
    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : 'No stack trace'
    
    return NextResponse.json({ 
      error: errorMessage,
      stack: errorStack
    }, { status: 500 })
  }
}
