import { PrismaClient } from '@prisma/client'
import { fetchEthSupply } from './dataFetcher'

// Server-side data fetching for static generation
// These functions are used during build time and ISR regeneration

export interface StaticEcosystemData {
  ethPrice: number
  ethSupply: number
  totalTrackedEth: number
  totalTrackedPercentage: number
  companies: {
    count: number
    totalEth: number
    totalValue: number
    percentage: number
  }
  etfs: {
    count: number
    totalEth: number
    totalValue: number
    percentage: number
  }
  formatted: {
    ethPrice: string
    ethSupply: string
    totalTrackedEth: string
    totalTrackedPercentage: string
    companyEth: string
    companyValue: string
    companyPercentage: string
    etfEth: string
    etfValue: string
    etfPercentage: string
  }
  lastUpdated: string
  message: string
}

export interface StaticCompanyData {
  id: number
  ticker: string | null
  name: string
  ethHoldings: number | null
  marketCap: string
  totalValue: number
  lastUpdated: string
  createdAt: string
  isActive: boolean
}

export interface StaticETFData {
  id: number
  symbol: string
  name: string | null
  ethHoldings: number | null
  totalValue: number
  aum: string
  expenseRatio: number | null
  nav: number | null
  lastUpdated: string
  createdAt: string
  isActive: boolean
}

export interface StaticNewsData {
  title: string
  description: string
  url: string
  publishedAt: string
  source: {
    name: string
  }
}

export interface StaticPageData {
  ecosystem: StaticEcosystemData
  companies: {
    companies: StaticCompanyData[]
    count: number
    ethPrice: number
    message: string
  }
  etfs: {
    etfs: StaticETFData[]
    count: number
    ethPrice: number
    message: string
  }
  news: {
    articles: StaticNewsData[]
    count: number
    message: string
  }
  generatedAt: string
}

// Fetch ecosystem summary data for static generation
export async function fetchStaticEcosystemData(): Promise<StaticEcosystemData> {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    
    // Fetch companies data (required table)
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: {
        ethHoldings: true,
        marketCap: true
      }
    })
    
    // Try to fetch ETFs data (optional table - may not exist in production yet)
    let etfs: Array<{ ethHoldings: number | null; totalValue: number | null }> = []
    try {
      etfs = await prisma.etf.findMany({
        where: { isActive: true },
        select: {
          ethHoldings: true,
          totalValue: true
        }
      })
    } catch (error: any) {
      console.log('⚠️ ETFs table not found in database, using empty array:', error.code)
      etfs = []
    }

    // Get ETH price from system metrics and live ETH supply from Etherscan
    const [systemMetrics, liveEthSupply] = await Promise.all([
      prisma.systemMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' },
        select: { ethPrice: true }
      }),
      fetchEthSupply()
    ])

    const ethPrice = systemMetrics?.ethPrice || 3500
    const ethSupply = liveEthSupply || 120709652 // Live ETH supply from Etherscan, fallback to current estimate

    // Calculate totals
    const companyTotalEth = companies.reduce((sum, company) => sum + Number(company.ethHoldings || 0), 0)
    const companyTotalValue = companyTotalEth * ethPrice
    const companyPercentage = (companyTotalEth / ethSupply) * 100

    const etfTotalEth = etfs.reduce((sum, etf) => sum + Number(etf.ethHoldings || 0), 0)
    const etfTotalValue = etfTotalEth * ethPrice
    const etfPercentage = (etfTotalEth / ethSupply) * 100

    const totalTrackedEth = companyTotalEth + etfTotalEth
    const totalTrackedPercentage = (totalTrackedEth / ethSupply) * 100

    return {
      ethPrice,
      ethSupply,
      totalTrackedEth,
      totalTrackedPercentage,
      companies: {
        count: companies.length,
        totalEth: companyTotalEth,
        totalValue: companyTotalValue,
        percentage: companyPercentage
      },
      etfs: {
        count: etfs.length,
        totalEth: etfTotalEth,
        totalValue: etfTotalValue,
        percentage: etfPercentage
      },
      formatted: {
        ethPrice: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(ethPrice),
        ethSupply: new Intl.NumberFormat('en-US').format(ethSupply),
        totalTrackedEth: new Intl.NumberFormat('en-US').format(totalTrackedEth),
        totalTrackedPercentage: `${totalTrackedPercentage.toFixed(3)}%`,
        companyEth: new Intl.NumberFormat('en-US').format(companyTotalEth),
        companyValue: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(companyTotalValue),
        companyPercentage: `${companyPercentage.toFixed(3)}%`,
        etfEth: new Intl.NumberFormat('en-US').format(etfTotalEth),
        etfValue: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(etfTotalValue),
        etfPercentage: `${etfPercentage.toFixed(3)}%`
      },
      lastUpdated: new Date().toISOString(),
      message: `Static data: ${companies.length} companies (${companyTotalEth.toFixed(0)} ETH), ${etfs.length} ETFs (${etfTotalEth.toFixed(0)} ETH)`
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Fetch companies data for static generation
export async function fetchStaticCompaniesData() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { ethHoldings: 'desc' }
    })

    // Get ETH price from system metrics
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' },
      select: { ethPrice: true }
    })
    const ethPrice = systemMetrics?.ethPrice || 3500

    const serializedCompanies = companies.map((company) => ({
      ...company,
      marketCap: company.marketCap?.toString() || '0',
      totalValue: (company.ethHoldings || 0) * ethPrice,
      lastUpdated: company.lastUpdated.toISOString(),
      createdAt: company.createdAt.toISOString(),
    })) as StaticCompanyData[]

    return {
      companies: serializedCompanies,
      count: serializedCompanies.length,
      ethPrice,
      message: 'Static companies data from database'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Fetch ETFs data for static generation
export async function fetchStaticETFsData() {
  const prisma = new PrismaClient()
  try {
    await prisma.$connect()
    
    // Try to fetch ETFs data (table may not exist in production yet)
    let etfs: any[] = []
    try {
      etfs = await prisma.etf.findMany({
        where: { isActive: true },
        orderBy: { aum: 'desc' }
      })
    } catch (error: any) {
      console.log('⚠️ ETFs table not found in database, returning empty result:', error.code)
      return {
        etfs: [],
        count: 0,
        ethPrice: 3500,
        message: 'ETFs table not found - using empty data'
      }
    }

    // Get ETH price from system metrics
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' },
      select: { ethPrice: true }
    })
    const ethPrice = systemMetrics?.ethPrice || 3500

    const serializedEtfs = etfs.map((etf) => ({
      ...etf,
      aum: etf.aum?.toString() || '0',
      totalValue: (etf.ethHoldings || 0) * ethPrice,
      lastUpdated: etf.lastUpdated.toISOString(),
      createdAt: etf.createdAt.toISOString(),
    })) as StaticETFData[]

    return {
      etfs: serializedEtfs,
      count: serializedEtfs.length,
      ethPrice,
      message: 'Static ETF data from database'
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Fetch news data for static generation (fallback data)
export async function fetchStaticNewsData() {
  // For now, return fallback news data since NewsAPI requires API key
  const fallbackNews = [
    {
      title: "Ethereum ETF Market Continues Growth",
      description: "Institutional adoption of Ethereum through ETFs shows strong momentum with increased holdings across major funds.",
      url: "#",
      publishedAt: new Date().toISOString(),
      source: { name: "Crypto News" }
    },
    {
      title: "Corporate Treasury Strategies Include ETH",
      description: "More corporations are adding Ethereum to their treasury reserves as a hedge against inflation and currency devaluation.",
      url: "#",
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      source: { name: "Business Wire" }
    },
    {
      title: "Ethereum Network Upgrade Enhances Efficiency",
      description: "Latest network improvements continue to optimize transaction costs and processing speed for institutional users.",
      url: "#",
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      source: { name: "Tech Today" }
    }
  ]

  return {
    articles: fallbackNews,
    count: fallbackNews.length,
    message: 'Static fallback news data'
  }
}

// Main function to fetch all static data for the homepage
export async function fetchAllStaticData(): Promise<StaticPageData> {
  const [ecosystem, companies, etfs, news] = await Promise.all([
    fetchStaticEcosystemData(),
    fetchStaticCompaniesData(),
    fetchStaticETFsData(),
    fetchStaticNewsData()
  ])

  return {
    ecosystem,
    companies,
    etfs,
    news,
    generatedAt: new Date().toISOString()
  }
}
