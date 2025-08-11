import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma = new PrismaClient()

// Type definitions for SEC filings
interface WhereClause {
  isActive: boolean
  formType?: string
  companyName?: {
    contains: string
    mode: 'insensitive'
  }
  filingDate?: {
    gte?: Date
    lte?: Date
  }
}

interface OrderByClause {
  filingDate?: 'asc' | 'desc'
  companyName?: 'asc' | 'desc'
  formType?: 'asc' | 'desc'
}

/**
 * GET /api/sec-filings
 * Returns paginated list of SEC filings mentioning Ethereum
 * Supports sorting and filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'filingDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Filter parameters
    const formType = searchParams.get('formType')
    const company = searchParams.get('company')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where: WhereClause = {
      isActive: true
    }

    if (formType) {
      where.formType = formType
    }

    if (company) {
      where.companyName = {
        contains: company,
        mode: 'insensitive'
      }
    }

    if (startDate || endDate) {
      where.filingDate = {}
      if (startDate) {
        where.filingDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.filingDate.lte = new Date(endDate)
      }
    }

    // Build orderBy clause
    const orderBy: OrderByClause = {}
    if (sortBy === 'filingDate') {
      orderBy.filingDate = sortOrder as 'asc' | 'desc'
    } else if (sortBy === 'companyName') {
      orderBy.companyName = sortOrder as 'asc' | 'desc'
    } else if (sortBy === 'formType') {
      orderBy.formType = sortOrder as 'asc' | 'desc'
    } else {
      orderBy.filingDate = 'desc' // Default sort
    }

    // Execute queries (with error handling for missing table)
    let filings: unknown[] = []
    let totalCount = 0
    
    try {
      [filings, totalCount] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).secFiling.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          select: {
            id: true,
            accessionNumber: true,
            companyName: true,
            cik: true,
            formType: true,
            filingDate: true,
            reportTitle: true,
            edgarUrl: true,
            fullTextUrl: true,
            createdAt: true
          }
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (prisma as any).secFiling.count({ where })
      ])
    } catch {
      console.log('⚠️ SEC filings table not yet created in database')
      // Return empty results if table doesn't exist yet
      filings = []
      totalCount = 0
    }

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    console.log(`📊 SEC Filings API: Returned ${filings.length} filings (page ${page}/${totalPages})`)

    return NextResponse.json({
      success: true,
      data: {
        filings,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNextPage,
          hasPrevPage
        },
        filters: {
          sortBy,
          sortOrder,
          formType,
          company,
          startDate,
          endDate
        }
      }
    })

  } catch (error) {
    console.error('❌ Error fetching SEC filings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch SEC filings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * POST /api/sec-filings
 * Admin endpoint to refresh SEC filings data
 * Searches for new filings and updates database
 */
export async function POST() {
  try {
    // Import here to avoid issues during build
    const { searchEthereumFilings, formatFilingForDatabase, validateSecFiling } = await import('@/lib/secEdgarFetcher')
    
    console.log('🔄 Starting SEC filings refresh...')

    // Fetch recent filings from SEC EDGAR
    const recentFilings = await searchEthereumFilings(
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
      new Date().toISOString().split('T')[0], // Today
      100 // Max results
    )

    console.log(`📥 Found ${recentFilings.length} recent filings from SEC EDGAR`)

    let newFilingsCount = 0
    let updatedFilingsCount = 0
    let skippedFilingsCount = 0

    for (const filing of recentFilings) {
      try {
        // Validate filing data
        if (!validateSecFiling(filing)) {
          console.log(`⚠️ Skipping invalid filing: ${filing.accessionNumber}`)
          skippedFilingsCount++
          continue
        }

        // Format for database
        const formattedFiling = formatFilingForDatabase(filing)

        // Upsert filing (insert if new, update if exists)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await (prisma as any).secFiling.upsert({
          where: {
            accessionNumber: formattedFiling.accessionNumber
          },
          update: {
            companyName: formattedFiling.companyName,
            reportTitle: formattedFiling.reportTitle,
            edgarUrl: formattedFiling.edgarUrl,
            fullTextUrl: formattedFiling.fullTextUrl,
            updatedAt: new Date()
          },
          create: formattedFiling
        })

        // Check if this was a new filing or update
        const wasCreated = result.createdAt.getTime() === result.updatedAt.getTime()
        if (wasCreated) {
          newFilingsCount++
          console.log(`✅ Added new filing: ${filing.companyName} - ${filing.formType} (${filing.filingDate.toISOString().split('T')[0]})`)
        } else {
          updatedFilingsCount++
          console.log(`🔄 Updated filing: ${filing.companyName} - ${filing.formType}`)
        }

      } catch (filingError) {
        console.error(`❌ Error processing filing ${filing.accessionNumber}:`, filingError)
        skippedFilingsCount++
      }
    }

    // Get updated statistics
    let totalFilings = 0
    let recentFilingsCount = 0
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalFilings = await (prisma as any).secFiling.count({ where: { isActive: true } })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recentFilingsCount = await (prisma as any).secFiling.count({
        where: {
          isActive: true,
          filingDate: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    } catch {
      console.log('⚠️ Could not get filing statistics - table may not exist yet')
    }

    console.log(`✅ SEC filings refresh completed:`)
    console.log(`   New filings: ${newFilingsCount}`)
    console.log(`   Updated filings: ${updatedFilingsCount}`)
    console.log(`   Skipped filings: ${skippedFilingsCount}`)
    console.log(`   Total filings in database: ${totalFilings}`)

    return NextResponse.json({
      success: true,
      data: {
        newFilings: newFilingsCount,
        updatedFilings: updatedFilingsCount,
        skippedFilings: skippedFilingsCount,
        totalFilings,
        recentFilings: recentFilingsCount
      },
      message: `Successfully processed ${recentFilings.length} filings. Added ${newFilingsCount} new, updated ${updatedFilingsCount}, skipped ${skippedFilingsCount}.`
    })

  } catch (error) {
    console.error('❌ Error refreshing SEC filings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to refresh SEC filings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
