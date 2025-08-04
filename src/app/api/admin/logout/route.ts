import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Clear admin session cookie
    const cookieStore = await cookies()
    cookieStore.delete('admin-session')
    
    return NextResponse.json({
      success: true,
      message: 'Admin logout successful'
    })
    
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json({
      success: false,
      message: 'Logout failed'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to logout',
    method: 'POST'
  })
}
