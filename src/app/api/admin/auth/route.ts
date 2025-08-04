import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

/**
 * GET /api/admin/auth
 * Check simple cookie-based admin authentication
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const adminSession = cookieStore.get('admin-session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No valid admin session found'
      }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        role: 'admin',
        isAdmin: true
      },
      message: 'Admin authenticated'
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      success: false,
      authenticated: false,
      error: 'Auth check failed'
    }, { status: 500 })
  }
}
