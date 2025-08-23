import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, secret } = await request.json()
    
    // Temporary bypass for admin access
    const BYPASS_SECRET = process.env.ADMIN_BYPASS_SECRET || 'temp-admin-bypass-2025'
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL
    
    if (!email || !secret) {
      return NextResponse.json({ error: 'Email and secret required' }, { status: 400 })
    }
    
    if (email !== ADMIN_EMAIL || secret !== BYPASS_SECRET) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Create a temporary admin session cookie
    const response = NextResponse.json({ 
      success: true, 
      message: 'Admin bypass session created',
      redirectUrl: '/admin'
    })
    
    response.cookies.set('admin-bypass-session', JSON.stringify({
      email: email,
      isAdmin: true,
      expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })
    
    return response
    
  } catch (error) {
    console.error('Admin bypass error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
