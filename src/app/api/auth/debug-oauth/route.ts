import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        hasAdminEmail: !!process.env.ADMIN_EMAIL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: process.env.NODE_ENV,
        adminEmail: process.env.ADMIN_EMAIL?.replace(/(.{3}).*(@.*)/, '$1***$2'),
        googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
        googleClientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length,
      },
      session: {
        hasSession: !!session,
        userEmail: session?.user?.email || null,
        isAdmin: session?.user?.isAdmin || false,
        sessionExpires: session?.expires || null,
        fullSession: session
      },
      oauth: {
        providersEndpoint: `${process.env.NEXTAUTH_URL}/api/auth/providers`,
        signinEndpoint: `${process.env.NEXTAUTH_URL}/api/auth/signin/google`,
        callbackEndpoint: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
      },
      cookies: {
        sessionToken: request.cookies.get('next-auth.session-token')?.value || 'NOT_FOUND',
        csrfToken: request.cookies.get('next-auth.csrf-token')?.value || 'NOT_FOUND',
        callbackUrl: request.cookies.get('next-auth.callback-url')?.value || 'NOT_FOUND',
      }
    }
    
    console.log('🔍 OAuth Debug Info:', JSON.stringify(debugInfo, null, 2))
    
    return NextResponse.json(debugInfo, { status: 200 })
    
  } catch (error) {
    console.error('❌ OAuth Debug Error:', error)
    return NextResponse.json({ 
      error: 'Debug endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
