import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/admin/auth
 * Check NextAuth.js session for admin authentication
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No session found'
      }, { status: 401 })
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'User is not admin'
      }, { status: 403 })
    }
    
    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        email: session.user.email,
        name: session.user.name,
        isAdmin: session.user.isAdmin
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
