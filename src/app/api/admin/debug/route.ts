import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Get session from server
    const session = await getServerSession(authOptions)
    
    // Get environment variables (safely)
    const envCheck = {
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
      nodeEnv: process.env.NODE_ENV,
      adminEmail: process.env.ADMIN_EMAIL ? 
        process.env.ADMIN_EMAIL.substring(0, 3) + '***@' + process.env.ADMIN_EMAIL.split('@')[1] : 
        'not set',
      // Add more detailed checks
      googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
      googleClientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0,
      nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      googleClientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 10) + '...' || 'not set'
    }

    // Session analysis
    const sessionAnalysis = {
      hasSession: !!session,
      userEmail: session?.user?.email || null,
      isAdmin: session?.user?.isAdmin || false,
      sessionExpires: session?.expires || null,
    }

    // Check if admin email is in allowed list
    const allowedAdmins = process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL] : []
    const isEmailAllowed = session?.user?.email ? 
      allowedAdmins.includes(session.user.email) : false

    const debugInfo = {
      timestamp: new Date().toISOString(),
      environment: envCheck,
      session: sessionAnalysis,
      authorization: {
        allowedAdmins: allowedAdmins.map(email => 
          email.substring(0, 3) + '***@' + email.split('@')[1]
        ),
        isEmailAllowed,
        emailMatch: session?.user?.email === process.env.ADMIN_EMAIL
      },
      recommendations: [] as string[]
    }

    // Add recommendations based on issues found
    if (!envCheck.hasGoogleClientId || !envCheck.hasGoogleClientSecret) {
      debugInfo.recommendations.push('Missing Google OAuth credentials in environment variables')
    }
    
    if (!envCheck.hasNextAuthSecret) {
      debugInfo.recommendations.push('Missing NEXTAUTH_SECRET in environment variables')
    }
    
    if (!envCheck.hasAdminEmail) {
      debugInfo.recommendations.push('Missing ADMIN_EMAIL in environment variables')
    }
    
    if (session && !isEmailAllowed) {
      debugInfo.recommendations.push('User email is not in the allowed admin list')
    }
    
    if (!session) {
      debugInfo.recommendations.push('No active session found - user needs to sign in')
    }

    // Add specific troubleshooting for OAuth flow
    if (envCheck.googleClientIdLength < 50) {
      debugInfo.recommendations.push('Google Client ID appears too short - check if complete')
    }
    
    if (envCheck.googleClientSecretLength < 20) {
      debugInfo.recommendations.push('Google Client Secret appears too short - check if complete')
    }
    
    if (envCheck.nextAuthSecretLength < 32) {
      debugInfo.recommendations.push('NEXTAUTH_SECRET should be at least 32 characters long')
    }

    return NextResponse.json(debugInfo, { status: 200 })
    
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: 'Debug API failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
