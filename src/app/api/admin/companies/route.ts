import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

const ALLOWED_ADMIN_EMAILS = process.env.ADMIN_EMAIL?.split(',') || []

/**
 * Middleware to check admin authentication using NextAuth session
 */
async function checkAuth(request: NextRequest): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('🔍 checkAuth - Session:', session)
    console.log('🔍 checkAuth - ALLOWED_ADMIN_EMAILS:', ALLOWED_ADMIN_EMAILS)
    console.log('🔍 checkAuth - Request cookies:', request.cookies.getAll())
    
    if (!session?.user?.email) {
      console.log('❌ checkAuth - No session found')
      return false
    }
    
    console.log('🔍 checkAuth - User email:', session.user.email)
    console.log('🔍 checkAuth - Email in allowed list:', ALLOWED_ADMIN_EMAILS.includes(session.user.email))
    
    // Check if user email is in allowed admin list
    if (!ALLOWED_ADMIN_EMAILS.includes(session.user.email)) {
      console.log('❌ checkAuth - User is not admin:', session.user.email)
      return false
    }
    
    console.log('✅ checkAuth - Admin authenticated:', session.user.email)
    return true
  } catch (error: unknown) {
    console.error('❌ checkAuth - Error:', error)
    return false
  }
}

/**
 * GET /api/admin/companies
 * Get all companies for admin management
 */
export async function GET(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuth(request)
    
    console.log('🔍 GET /api/admin/companies - isAuthenticated:', isAuthenticated)
    
    if (!isAuthenticated) {
      console.log('❌ GET /api/admin/companies - Returning 401 Unauthorized')
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const companies = await prisma.company.findMany({
      orderBy: { ethHoldings: 'desc' }
    })

    return NextResponse.json({
      success: true,
      companies: companies.map((company) => ({
        ...company,
        marketCap: company.marketCap?.toString(),
        sharesOutstanding: company.sharesOutstanding?.toString()
      }))
    })

  } catch (error: unknown) {
    console.error('Failed to fetch companies:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch companies'
    }, { status: 500 })
  }
}

/**
 * POST /api/admin/companies
 * Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuth(request)
    
    if (!isAuthenticated) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const data = await request.json()
    
    // Validate required fields
    if (!data.name || !data.ticker) {
      return NextResponse.json({
        success: false,
        error: 'Name and ticker are required'
      }, { status: 400 })
    }

    // Check if ticker already exists
    const existingCompany = await prisma.company.findUnique({
      where: { ticker: data.ticker }
    })

    if (existingCompany) {
      return NextResponse.json({
        success: false,
        error: 'Company with this ticker already exists'
      }, { status: 400 })
    }

    const company = await prisma.company.create({
      data: {
        name: data.name,
        ticker: data.ticker,
        website: data.website || null,
        ethHoldings: data.ethHoldings || 0,
        ethAddresses: data.ethAddresses || null,
        marketCap: data.marketCap ? BigInt(data.marketCap) : null,
        sharesOutstanding: data.sharesOutstanding ? BigInt(data.sharesOutstanding) : null,
        stockPrice: data.stockPrice || null,
        ethPerShare: data.ethPerShare || null,
        mnavRatio: data.mnavRatio || null,
        stakingYield: data.stakingYield || null,
        yieldSources: data.yieldSources || null,
        capitalStructure: data.capitalStructure || null,
        fundingSources: data.fundingSources || null,
        isActive: data.isActive !== undefined ? data.isActive : true
      }
    })

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        marketCap: company.marketCap?.toString(),
        sharesOutstanding: company.sharesOutstanding?.toString()
      }
    })

  } catch (error: unknown) {
    console.error('Failed to create company:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create company'
    }, { status: 500 })
  }
}

/**
 * PUT /api/admin/companies
 * Update an existing company
 */
export async function PUT(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuth(request)
    
    if (!isAuthenticated) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const data = await request.json()
    
    console.log('🔍 PUT /api/admin/companies - Update data received:', JSON.stringify(data, null, 2))
    console.log('🔍 PUT /api/admin/companies - ETH Holdings value:', data.ethHoldings, 'Type:', typeof data.ethHoldings)
    
    if (!data.id) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 })
    }

    // Find existing company for comparison
    const existingCompany = await prisma.company.findUnique({
      where: { id: data.id }
    })
    
    if (!existingCompany) {
      console.log('❌ PUT /api/admin/companies - Company not found with ID:', data.id)
      return NextResponse.json({
        success: false,
        error: 'Company not found'
      }, { status: 404 })
    }
    
    console.log('📊 PUT /api/admin/companies - Existing company:', existingCompany.name)
    console.log('📊 PUT /api/admin/companies - Current ETH Holdings:', existingCompany.ethHoldings)
    console.log('📊 PUT /api/admin/companies - New ETH Holdings:', data.ethHoldings)

    const company = await prisma.company.update({
      where: { id: data.id },
      data: {
        name: data.name,
        ticker: data.ticker,
        website: data.website,
        ethHoldings: data.ethHoldings,
        ethAddresses: data.ethAddresses,
        marketCap: data.marketCap ? BigInt(data.marketCap) : null,
        sharesOutstanding: data.sharesOutstanding ? BigInt(data.sharesOutstanding) : null,
        stockPrice: data.stockPrice,
        ethPerShare: data.ethPerShare,
        mnavRatio: data.mnavRatio,
        stakingYield: data.stakingYield,
        yieldSources: data.yieldSources,
        capitalStructure: data.capitalStructure,
        fundingSources: data.fundingSources,
        isActive: data.isActive,
        lastUpdated: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      company: {
        ...company,
        marketCap: company.marketCap?.toString(),
        sharesOutstanding: company.sharesOutstanding?.toString()
      }
    })

  } catch (error: unknown) {
    console.error('Failed to update company:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update company'
    }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/companies
 * Delete a company (soft delete by setting isActive to false)
 */
export async function DELETE(request: NextRequest) {
  try {
    const isAuthenticated = await checkAuth(request)
    
    if (!isAuthenticated) {
      return NextResponse.json({
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('id')
    
    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Company ID is required'
      }, { status: 400 })
    }

    const company = await prisma.company.update({
      where: { id: parseInt(companyId) },
      data: {
        isActive: false,
        lastUpdated: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Company deactivated successfully',
      company: {
        ...company,
        marketCap: company.marketCap?.toString(),
        sharesOutstanding: company.sharesOutstanding?.toString()
      }
    })

  } catch (error: unknown) {
    console.error('Failed to delete company:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to delete company'
    }, { status: 500 })
  }
}
