import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Ensure database connection is established
    await prisma.$connect()
    console.log('✅ Database connected for debug endpoint')
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

    const companyTotalEth = companiesResult.reduce((sum: number, company) => sum + (company.ethHoldings || 0), 0)
    const etfTotalEth = etfsResult.reduce((sum: number, etf) => sum + (etf.ethHoldings || 0), 0)

    // Convert BigInt values to numbers for JSON serialization
    const serializeData = (data: unknown) => {
      return JSON.parse(JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? Number(value) : value
      ))
    }

    return NextResponse.json({
      summary: {
        filteredCompaniesCount: companiesResult.length,
        filteredEtfsCount: etfsResult.length,
        filteredCompaniesTotalEth: companiesResult.reduce((sum, c) => sum + (Number(c.ethHoldings) || 0), 0),
        filteredEtfsTotalEth: etfsResult.reduce((sum, e) => sum + (Number(e.ethHoldings) || 0), 0),
        allCompaniesCount: allCompanies.length,
        allEtfsCount: allEtfs.length
      },
      filteredCompanies: serializeData(companiesResult),
      filteredEtfs: serializeData(etfsResult),
      allCompanies: serializeData(allCompanies),
      allEtfs: serializeData(allEtfs)
    })
  } catch (error) {
    console.error('Debug homepage data error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch debug data',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
