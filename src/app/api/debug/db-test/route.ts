import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test query execution
    const companyCount = await prisma.company.count()
    const etfCount = await prisma.etf.count()
    const systemMetricsCount = await prisma.systemMetrics.count()
    
    console.log(`📊 Database query results: ${companyCount} companies, ${etfCount} ETFs, ${systemMetricsCount} system metrics`)
    
    // Test a simple company query
    const firstCompany = await prisma.company.findFirst({
      select: { name: true, ticker: true, ethHoldings: true }
    })
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and queries successful',
      data: {
        companyCount,
        etfCount,
        systemMetricsCount,
        firstCompany,
        environment: process.env.NODE_ENV,
        databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing',
        timestamp: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
      databaseUrl: process.env.DATABASE_URL ? 'Set' : 'Missing',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
