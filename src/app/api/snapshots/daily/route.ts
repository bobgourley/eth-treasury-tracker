import { NextResponse } from 'next/server'

// Daily snapshot feature temporarily disabled during deployment
// Will be re-enabled after database migration

export async function POST() {
  return NextResponse.json({
    message: 'Daily snapshot feature temporarily disabled during deployment',
    status: 'disabled'
  })
}

export async function GET() {
  return NextResponse.json({
    snapshots: [],
    count: 0,
    message: 'Daily snapshot feature temporarily disabled during deployment'
  })
}
