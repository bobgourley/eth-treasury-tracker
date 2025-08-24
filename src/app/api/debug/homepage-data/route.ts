import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Same queries as homepage
    const [companiesResult, etfsResult] = await Promise.all([
      prisma.company.findMany({
        where: { 
          isActive: true,
          ethHoldings: { not: null }
        },
        orderBy: { ethHoldings: 'desc' }
      }),
      prisma.etf.findMany({
        where: { 
          isActive: true,
          ethHoldings: { not: null }
        },
        orderBy: { ethHoldings: 'desc' }
      })
    ])

    // Also check all companies and ETFs without filters
    const [allCompanies, allEtfs] = await Promise.all([
      prisma.company.findMany({
        select: {
          id: true,
          name: true,
          ticker: true,
          ethHoldings: true,
          isActive: true
        }
      }),
      prisma.etf.findMany({
        select: {
          id: true,
          symbol: true,
          name: true,
          ethHoldings: true,
          isActive: true
        }
      })
    ])

    const companyTotalEth = companiesResult.reduce((sum: number, company: any) => sum + (company.ethHoldings || 0), 0)
    const etfTotalEth = etfsResult.reduce((sum: number, etf: any) => sum + (etf.ethHoldings || 0), 0)

    return NextResponse.json({
      debug: {
        filteredCompanies: companiesResult.length,
        filteredEtfs: etfsResult.length,
        companyTotalEth,
        etfTotalEth,
        allCompaniesCount: allCompanies.length,
        allEtfsCount: allEtfs.length
      },
      filteredCompanies: companiesResult,
      filteredEtfs: etfsResult,
      allCompanies: allCompanies,
      allEtfs: allEtfs
    })
  } catch (error) {
    console.error('Debug homepage data error:', error)
    return NextResponse.json({ error: 'Failed to fetch debug data' }, { status: 500 })
  }
}
