import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Static fallback data for MVP (updated with current holdings as of July 2025)
const fallbackCompanies = [
  {
    id: 1,
    name: 'BitMine Immersion Technologies',
    ticker: 'BMNR',
    ethHoldings: 566776.0, // Updated July 24, 2025 - $2B+ in ETH
    marketCap: '2800000000', // Updated market cap
    sharesOutstanding: '95000000',
    ethPerShare: 0.00597,
    mnavRatio: 1.45,
    stakingYield: 5.2,
    yieldSources: 'ETH staking, immersion cooling operations',
    capitalStructure: 'Operates immersion cooling infrastructure and maintains a strategic ETH treasury for long-term value creation',
    fundingSources: 'Immersion cooling services, ETH treasury strategy',
    stockPrice: 52.30,
    website: 'https://bitmineimmersion.com',
    lastStockUpdate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'SharpLink Gaming',
    ticker: 'SBET',
    ethHoldings: 360000.0, // Updated July 22, 2025 - $1.3B+ in ETH
    marketCap: '1650000000', // Updated market cap
    sharesOutstanding: '42000000',
    ethPerShare: 0.00857,
    mnavRatio: 1.38,
    stakingYield: 4.8,
    yieldSources: 'ETH staking, gaming platform yields',
    capitalStructure: 'Combines online gaming operations with a substantial ETH treasury strategy to drive shareholder value',
    fundingSources: 'Gaming platform revenue, ETH treasury growth',
    stockPrice: 38.75,
    website: 'https://sharplink.com',
    lastStockUpdate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Bit Digital',
    ticker: 'BTBT',
    ethHoldings: 125000.0, // Updated estimate
    marketCap: '520000000', // Updated market cap
    sharesOutstanding: '85000000',
    ethPerShare: 0.00147,
    mnavRatio: 1.28,
    stakingYield: 4.5,
    yieldSources: 'ETH staking, validator operations',
    capitalStructure: 'Operates as a digital asset company centered on Ethereum staking and infrastructure',
    fundingSources: 'Digital asset operations, ETH staking infrastructure',
    stockPrice: 15.20,
    website: 'https://bitdigital.com',
    lastStockUpdate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'BTCS Inc.',
    ticker: 'BTCS',
    ethHoldings: 58000.0, // Updated estimate
    marketCap: '220000000',
    sharesOutstanding: '28000000',
    ethPerShare: 0.00207,
    mnavRatio: 1.20,
    stakingYield: 4.2,
    yieldSources: 'ETH staking, network participation yield',
    capitalStructure: 'Provides blockchain infrastructure with a core strategy of holding and staking ETH for network participation and yield',
    fundingSources: 'Blockchain infrastructure services, ETH staking',
    stockPrice: 8.45,
    website: 'https://btcs.com',
    lastStockUpdate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    name: 'GameSquare Holdings',
    ticker: 'GAME',
    ethHoldings: 12500.0, // Updated estimate
    marketCap: '65000000',
    sharesOutstanding: '15000000',
    ethPerShare: 0.000833,
    mnavRatio: 1.08,
    stakingYield: 3.5,
    yieldSources: 'NFT yields, gaming partnerships',
    capitalStructure: 'Pivots media and entertainment activities to build an Ethereum-based digital asset treasury and explore NFT yields',
    fundingSources: 'Media and entertainment operations, digital asset strategy',
    stockPrice: 4.25,
    website: 'https://gamesquare.com',
    lastStockUpdate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    name: 'KR1 plc',
    ticker: 'KR1',
    ethHoldings: 6200.0, // Updated estimate
    marketCap: '52000000',
    sharesOutstanding: '12000000',
    ethPerShare: 0.000517,
    mnavRatio: 1.15,
    stakingYield: 4.0,
    yieldSources: 'ETH staking, crypto asset investments',
    capitalStructure: 'Invests in and accumulates ETH and other crypto assets as a primary treasury and growth strategy',
    fundingSources: 'Crypto investments, ETH accumulation strategy',
    stockPrice: 4.33,
    website: 'https://kr1.io',
    lastStockUpdate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 7,
    name: 'Exodus Movement',
    ticker: 'EXOD',
    ethHoldings: 2800.0, // Updated estimate
    marketCap: '135000000',
    sharesOutstanding: '75000000',
    ethPerShare: 0.000037,
    mnavRatio: 1.02,
    stakingYield: 3.2,
    yieldSources: 'Platform fees, ETH treasury growth',
    capitalStructure: 'Operates a crypto wallet platform and holds ETH directly on its balance sheet to drive treasury growth and product innovation',
    fundingSources: 'Wallet platform revenue, product innovation',
    stockPrice: 1.80,
    website: 'https://exodus.com',
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
      orderBy: { ethHoldings: 'desc' }
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
    return NextResponse.json(fallbackCompanies)
  }
}
