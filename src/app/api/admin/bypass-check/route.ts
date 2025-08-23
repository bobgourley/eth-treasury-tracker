import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Check for admin session cookie
    const sessionCookie = request.cookies.get('admin-session')
    
    if (!sessionCookie) {
      return NextResponse.json({ isAdmin: false, message: 'No admin session found' })
    }

    try {
      const sessionData = JSON.parse(sessionCookie.value)
      
      // Check if session is still valid (24 hours)
      const sessionAge = Date.now() - sessionData.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      
      if (sessionAge > maxAge) {
        return NextResponse.json({ 
          isAdmin: false, 
          message: 'Admin session expired' 
        })
      }
      
      if (sessionData.isAdmin && sessionData.email) {
        return NextResponse.json({ 
          isAdmin: true, 
          email: sessionData.email,
          message: 'Valid admin session found'
        })
      }
      
      return NextResponse.json({ 
        isAdmin: false, 
        message: 'Invalid admin session data' 
      })
      
    } catch (parseError) {
      console.error('Error parsing admin session cookie:', parseError)
      return NextResponse.json({ 
        isAdmin: false, 
        message: 'Invalid admin session format' 
      })
    }
    
  } catch (error) {
    console.error('Admin session check error:', error)
    return NextResponse.json({ 
      isAdmin: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
