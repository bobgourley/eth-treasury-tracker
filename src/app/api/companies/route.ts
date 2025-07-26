import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { ethHoldings: 'desc' },
    })

    // Convert BigInt to string for JSON serialization
    const serializedCompanies = companies.map((company: any) => ({
      ...company,
      marketCap: company.marketCap?.toString(),
      sharesOutstanding: company.sharesOutstanding?.toString(),
    }))

    return NextResponse.json(serializedCompanies)
  } catch (error: unknown) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}
