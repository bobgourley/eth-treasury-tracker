import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Simple admin password (in production, use proper hashing)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    if (!password) {
      return NextResponse.json({
        success: false,
        message: 'Password required'
      }, { status: 400 })
    }
    
    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({
        success: false,
        message: 'Invalid password'
      }, { status: 401 })
    }
    
    // Set admin session cookie
    const cookieStore = await cookies()
    cookieStore.set('admin-session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 4 // 4 hours
    })
    
    return NextResponse.json({
      success: true,
      message: 'Admin login successful'
    })
    
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Login failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to login with password',
    method: 'POST',
    body: { password: 'your-admin-password' }
  })
}
