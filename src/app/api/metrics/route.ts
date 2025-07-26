import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const companies = await prisma.company.findMany({
      where: { isActive: true },
    })

    const systemMetrics = await prisma.systemMetrics.findFirst()

    // Calculate totals
    const totalEthHeld = companies.reduce((sum, company) => sum + (company.ethHoldings || 0), 0)
    const totalMarketCap = companies.reduce((sum, company) => {
      const marketCap = company.marketCap ? BigInt(company.marketCap.toString()) : BigInt(0)
      return sum + marketCap
    }, BigInt(0))

    // Get ETH price (fallback to reasonable default if not available)
    const ethPrice = systemMetrics?.ethPrice || 3680.0
    const totalEthSupply = 120500000.0 // Static value for MVP

    // Calculate derived metrics
    const totalEthValue = totalEthHeld * ethPrice
    const ethSupplyPercentage = (totalEthHeld / totalEthSupply) * 100

    const metrics = {
      totalEthHeld,
      totalEthValue,
      totalMarketCap: totalMarketCap.toString(),
      ethPrice,
      ethSupplyPercentage,
      totalEthSupply,
      companyCount: companies.length,
      lastUpdated: systemMetrics?.lastUpdate || new Date(),
    }

    return NextResponse.json(metrics)
  } catch (error: unknown) {
    console.error('Database error, using static fallback metrics:', error)
    
    // Static fallback metrics for MVP
    const fallbackMetrics = {
      totalEthHeld: 958132.0, // Sum of static companies
      totalEthValue: 958132.0 * 3680.0, // ETH value at current price
      totalMarketCap: '2870000000', // Sum of static company market caps
      ethPrice: 3680.0,
      ethSupplyPercentage: (958132.0 / 120500000.0) * 100, // ~0.795%
      totalEthSupply: 120500000.0,
      companyCount: 3,
      lastUpdated: new Date(),
    }
    
    return NextResponse.json(fallbackMetrics)
  }
}
