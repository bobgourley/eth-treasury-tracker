import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const metrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' },
    })

    if (!metrics) {
      // Calculate metrics if none exist
      const companies = await prisma.company.findMany({
        where: { isActive: true },
      })

      const totalEthHeld = companies.reduce((sum: number, company) => sum + (company.ethHoldings || 0), 0)
      const ethPrice = 3680.0 // Current ETH price in USD (approximate)
      const totalEthValue = totalEthHeld * ethPrice
      const totalMarketCap = companies.reduce((sum: number, company) => sum + Number(company.marketCap || 0), 0)
      const totalEthSupply = 120500000 // Approximate total ETH supply
      const ethSupplyPercent = (totalEthHeld / totalEthSupply) * 100
      
      const newMetrics = await prisma.systemMetrics.create({
        data: {
          totalEthHoldings: totalEthHeld,
          totalCompanies: companies.length,
          ethPrice: ethPrice,
          totalEthValue: totalEthValue,
          totalMarketCap: totalMarketCap,
          ethSupplyPercent: ethSupplyPercent,
        },
      })

      return NextResponse.json(newMetrics)
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
