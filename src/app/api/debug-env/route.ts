import { NextResponse } from 'next/server'

export async function GET() {
  // Debug endpoint disabled for security
  return NextResponse.json({ message: 'Debug endpoint disabled' }, { status: 404 })
}
