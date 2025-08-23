import { NextRequest, NextResponse } from 'next/server'
import { getAllowedAdminEmails } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const sessionCookie = request.cookies.get('admin-session')
    let sessionInfo = null
    
    if (sessionCookie) {
      try {
        sessionInfo = JSON.parse(sessionCookie.value)
      } catch (e) {
        sessionInfo = { error: 'Invalid session format' }
      }
    }
    
    // Get environment variables (safely)
    const envCheck = {
      hasAdminEmail: !!process.env.ADMIN_EMAIL,
      hasAdminBypassSecret: !!process.env.ADMIN_BYPASS_SECRET,
      nodeEnv: process.env.NODE_ENV,
      adminEmail: process.env.ADMIN_EMAIL ? 
        process.env.ADMIN_EMAIL.substring(0, 3) + '***@' + process.env.ADMIN_EMAIL.split('@')[1] : 
        'not set'
    }

    // Session info
    const sessionData = {
      exists: !!sessionInfo,
      sessionInfo: sessionInfo || null,
      isAdmin: sessionInfo?.isAdmin || false,
      email: sessionInfo?.email || null
    }

    // Authorization check
    const authCheck = {
      isAuthenticated: !!sessionInfo,
      isAuthorized: !!sessionInfo?.isAdmin,
      emailInAllowedList: sessionInfo?.email ? 
        getAllowedAdminEmails().includes(sessionInfo.email) : false
    }

    // Recommendations
    const recommendations = []
    
    if (!envCheck.hasAdminEmail) {
      recommendations.push('Set ADMIN_EMAIL environment variable with authorized admin emails')
    }
    
    if (!envCheck.hasAdminBypassSecret) {
      recommendations.push('Set ADMIN_BYPASS_SECRET environment variable')
    }
    
    if (!sessionInfo) {
      recommendations.push('User needs to sign in with admin credentials')
    } else if (!sessionInfo.isAdmin) {
      recommendations.push('User email not in admin allowlist - check ADMIN_EMAIL environment variable')
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      session: sessionData,
      authorization: authCheck,
      recommendations,
      allowedEmails: getAllowedAdminEmails(),
      debug: {
        userAgent: request.headers.get('user-agent'),
        host: request.headers.get('host'),
        origin: request.headers.get('origin')
      }
    })
    
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      error: 'Debug API failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
