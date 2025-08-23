import { NextResponse } from 'next/server'

export async function GET() {
  // Debug production environment variables (safely)
  const envCheck = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'MISSING',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'MISSING',
    NODE_ENV: process.env.NODE_ENV || 'MISSING'
  }

  return NextResponse.json({
    environment: envCheck,
    timestamp: new Date().toISOString()
  })
}
