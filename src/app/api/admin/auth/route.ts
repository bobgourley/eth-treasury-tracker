import { NextResponse } from 'next/server'

/**
 * GET /api/admin/auth
 * Simple auth check for localStorage-based authentication
 * For MVP, we'll just return authenticated: true since the admin page
 * already handles authentication via localStorage
 */
export async function GET() {
  try {
    // For MVP with simple localStorage auth, we assume if they reached
    // the admin page, they're authenticated
    return NextResponse.json({
      success: true,
      authenticated: true,
      message: 'Simple auth active'
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
