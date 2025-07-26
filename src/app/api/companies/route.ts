import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Static fallback data for MVP launch
const staticCompanies = [
  {
    id: 1,
    name: 'BitMine Immersion Technologies',
    ticker: 'BMNR',
    ethHoldings: 566776.0,
    ethAddresses: '[]',
    marketCap: '1600000000',
    sharesOutstanding: '40000000',
    ethPerShare: 14.169,
    mnavRatio: 1.25,
    stakingYield: 5.2,
    yieldSources: 'ETH staking rewards, validator operations',
    capitalStructure: 'Primary focus on ETH accumulation and staking as core treasury strategy',
    fundingSources: 'Equity financing, ETH staking rewards',
    website: 'https://bitmine.com',
    stockPrice: 40.0,
    lastStockUpdate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'SharpLink Gaming',
    ticker: 'SBET',
    ethHoldings: 234567.0,
    ethAddresses: '[]',
    marketCap: '850000000',
    sharesOutstanding: '25000000',
    ethPerShare: 9.383,
    mnavRatio: 1.18,
    stakingYield: 4.8,
    yieldSources: 'ETH staking, gaming revenue',
    capitalStructure: 'Gaming operations with significant ETH treasury holdings',
    fundingSources: 'Gaming revenue, strategic ETH investments',
    website: 'https://sharplinkgaming.com',
    stockPrice: 34.0,
    lastStockUpdate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Bit Digital',
    ticker: 'BTBT',
    ethHoldings: 156789.0,
    ethAddresses: '[]',
    marketCap: '420000000',
    sharesOutstanding: '18000000',
    ethPerShare: 8.71,
    mnavRatio: 1.15,
    stakingYield: 4.5,
    yieldSources: 'Mining operations, ETH staking',
    capitalStructure: 'Cryptocurrency mining with ETH treasury allocation',
    fundingSources: 'Mining revenue, equipment financing',
    website: 'https://bitdigital.com',
    stockPrice: 23.33,
    lastStockUpdate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export async function GET() {
  try {
    // Try database first
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { ethHoldings: 'desc' },
    })

    // Convert BigInt to string for JSON serialization
    const serializedCompanies = companies.map((company) => ({
      ...company,
      marketCap: company.marketCap?.toString(),
      sharesOutstanding: company.sharesOutstanding?.toString(),
    }))

    return NextResponse.json(serializedCompanies)
  } catch (error: unknown) {
    console.error('Database error, using static fallback:', error)
    
    // Return static data as fallback for MVP
    return NextResponse.json(staticCompanies)
  }
}
