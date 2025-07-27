import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Get all companies with detailed info
    const companies = await prisma.company.findMany({
      orderBy: { ethHoldings: 'desc' }
    })

    // Get companies with different filters to see what's happening
    const activeCompanies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { ethHoldings: 'desc' }
    })

    const companiesWithEth = await prisma.company.findMany({
      where: { 
        ethHoldings: { gt: 0 }
      },
      orderBy: { ethHoldings: 'desc' }
    })

    const companiesWithValidData = await prisma.company.findMany({
      where: { 
        AND: [
          { ethHoldings: { not: null } },
          { ethHoldings: { gt: 0 } },
          { marketCap: { not: null } }
        ]
      },
      orderBy: { ethHoldings: 'desc' }
    })

    return NextResponse.json({
      totalCompanies: companies.length,
      activeCompanies: activeCompanies.length,
      companiesWithEth: companiesWithEth.length,
      companiesWithValidData: companiesWithValidData.length,
      allCompanies: companies.map(c => ({
        id: c.id,
        name: c.name,
        ticker: c.ticker,
        ethHoldings: c.ethHoldings,
        marketCap: c.marketCap,
        isActive: c.isActive
      })),
      activeOnly: activeCompanies.map(c => ({
        id: c.id,
        name: c.name,
        ticker: c.ticker,
        ethHoldings: c.ethHoldings,
        isActive: c.isActive
      }))
    })
  } catch (error) {
    console.error('Diagnostic error:', error)
    return NextResponse.json({ error: 'Database error', details: error }, { status: 500 })
  }
}
