import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Updated DATABASE_URL to use Session Pooler - testing connection

export async function GET() {
  try {
    // Test basic database connection
    console.log('Testing database connection...')
    
    // Check environment variables
    const dbUrl = process.env.DATABASE_URL
    const hasDbUrl = !!dbUrl
    const dbUrlPrefix = dbUrl ? dbUrl.substring(0, 20) + '...' : 'Not set'
    
    console.log('Database URL exists:', hasDbUrl)
    console.log('Database URL prefix:', dbUrlPrefix)
    
    // Test Prisma connection
    await prisma.$connect()
    console.log('Prisma connected successfully')
    
    // Count companies
    const companyCount = await prisma.company.count()
    console.log('Company count:', companyCount)
    
    // Get first company if exists
    const firstCompany = await prisma.company.findFirst()
    console.log('First company:', firstCompany?.name || 'None')
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        url_exists: hasDbUrl,
        url_prefix: dbUrlPrefix,
        company_count: companyCount,
        first_company: firstCompany?.name || null
      }
    })
  } catch (error: unknown) {
    console.error('Debug API error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      database: {
        connected: false,
        url_exists: !!process.env.DATABASE_URL,
        url_prefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'Not set'
      }
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
