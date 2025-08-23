import { NextRequest, NextResponse } from 'next/server'
import { validateAdminCredentials } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, secret } = await request.json()

    if (!email || !secret) {
      return NextResponse.json({ error: 'Email and secret are required' }, { status: 400 })
    }

    if (!validateAdminCredentials(email, secret)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create response with secure cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Admin login successful',
      isAdmin: true 
    })

    // Set secure httpOnly cookie for admin session
    response.cookies.set('admin-session', JSON.stringify({
      email,
      isAdmin: true,
      timestamp: Date.now()
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
