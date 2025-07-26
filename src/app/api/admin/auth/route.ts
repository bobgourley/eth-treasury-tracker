import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdmin, generateSessionToken, createSession, destroySession } from '@/lib/auth'
import { cookies } from 'next/headers'

/**
 * POST /api/admin/auth
 * Admin login endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'Username and password are required'
      }, { status: 400 })
    }

    const isValid = await authenticateAdmin(username, password)

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }

    // Create session
    const sessionToken = generateSessionToken()
    createSession(sessionToken)

    // Set secure cookie
    const cookieStore = await cookies()
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 // 1 hour
    })

    return NextResponse.json({
      success: true,
      message: 'Authentication successful'
    })

  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/auth
 * Admin logout endpoint
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (sessionToken) {
      destroySession(sessionToken)
    }

    // Clear cookie
    cookieStore.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0
    })

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({
      success: false,
      error: 'Logout failed'
    }, { status: 500 })
  }
}

/**
 * GET /api/admin/auth
 * Check authentication status
 */
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('admin_session')?.value

    if (!sessionToken) {
      return NextResponse.json({
        authenticated: false
      })
    }

    // Import validateSession here to avoid circular imports
    const { validateSession } = await import('@/lib/auth')
    const isValid = validateSession(sessionToken)

    return NextResponse.json({
      authenticated: isValid
    })

  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      authenticated: false
    })
  }
}
