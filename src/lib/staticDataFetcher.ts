import { PrismaClient } from '@prisma/client'
import { fetchEthSupply } from './dataFetcher'

// Server-side data fetching for static generation
// These functions are used during build time and ISR regeneration

// ETF fallback data (same as main ETF API)
const ETF_DATA = {
  'ETHA': { name: 'iShares Ethereum Trust ETF', estimatedEthHoldings: 2730000, estimatedAum: 10490000000, expenseRatio: 0.25 },
  'ETHE': { name: 'Grayscale Ethereum Trust', estimatedEthHoldings: 1108000, estimatedAum: 4260000000, expenseRatio: 2.5 },
  'ETH': { name: 'Grayscale Ethereum Mini Trust', estimatedEthHoldings: 642000, estimatedAum: 2470000000, expenseRatio: 0.25 },
  'FETH': { name: 'Fidelity Ethereum Fund', estimatedEthHoldings: 598000, estimatedAum: 2300000000, expenseRatio: 0.25 },
  'ETHW': { name: 'Bitwise Ethereum ETF', estimatedEthHoldings: 132000, estimatedAum: 507130000, expenseRatio: 0.25 },
  'ETHV': { name: 'VanEck Ethereum ETF', estimatedEthHoldings: 55200, estimatedAum: 212340000, expenseRatio: 0.75 },
  'EZET': { name: 'Franklin Ethereum ETF', estimatedEthHoldings: 19600, estimatedAum: 75290000, expenseRatio: 0.30 },
  'CETH': { name: '21Shares Core Ethereum ETF', estimatedEthHoldings: 11500, estimatedAum: 44290000, expenseRatio: 0.20 },
  'QETH': { name: 'Invesco Galaxy Ethereum ETF', estimatedEthHoldings: 9900, estimatedAum: 38150000, expenseRatio: 0.40 }
}

const ETF_SYMBOLS = Object.keys(ETF_DATA)

// Helper function to get fallback ETF data for static generation
function getFallbackStaticEtfData() {
  const fallbackEtfs = ETF_SYMBOLS.map((symbol, index) => {
    const etfInfo = ETF_DATA[symbol as keyof typeof ETF_DATA]
    const variation = 0.95 + (Math.random() * 0.1) // 95% to 105%
    const ethHoldings = etfInfo.estimatedEthHoldings * variation
    const aum = etfInfo.estimatedAum * variation
    // ETH price should be fetched from database, not hardcoded
    // This is a fallback for static generation only
    const ethPrice = 3500
    const totalValue = ethHoldings * ethPrice
    
    return {
      id: index + 1,
      symbol,
      name: etfInfo.name,
      ethHoldings,
      aum: aum.toString(),
      totalValue,
      expenseRatio: etfInfo.expenseRatio,
      nav: aum > 0 ? (aum / 1000000) : 100,
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isActive: true
    }
  })
  
  fallbackEtfs.sort((a, b) => b.ethHoldings - a.ethHoldings)
  
  return {
    etfs: fallbackEtfs as StaticETFData[],
    count: fallbackEtfs.length,
    ethPrice: 3484.13,
    message: 'Using fallback ETF data for static generation'
  }
}

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
export async function fetchStaticEcosystemData() {
  const prisma = new PrismaClient()
  try {
    // Ensure database connection is established (same pattern as working ETF API)
    await prisma.$connect()
    console.log('✅ Database connected for ecosystem data')
    
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
      console.log('🔍 Fetching ETF data for ecosystem summary...')
      etfs = await prisma.etf.findMany({
        where: { isActive: true },
        select: {
          ethHoldings: true,
          totalValue: true
        }
      })
      console.log(`✅ Found ${etfs.length} ETFs in database for ecosystem data`)
      
      // If database is empty, use fallback data
      if (!etfs || etfs.length === 0) {
        console.log('⚠️ No ETFs in database - using fallback data for ecosystem calculation')
        const fallbackData = getFallbackStaticEtfData()
        etfs = fallbackData.etfs.map(etf => ({
          ethHoldings: etf.ethHoldings,
          totalValue: etf.totalValue
        }))
      }
    } catch (error: unknown) {
      console.log('⚠️ ETFs table not found in database, using fallback data for ecosystem:', error instanceof Error ? error.message : 'Unknown error')
      const fallbackData = getFallbackStaticEtfData()
      etfs = fallbackData.etfs.map(etf => ({
        ethHoldings: etf.ethHoldings,
        totalValue: etf.totalValue
      }))
    }

    // Get ETH price from system metrics and live ETH supply from Etherscan
    const [systemMetrics, liveEthSupply] = await Promise.all([
      prisma.systemMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' },
        select: { ethPrice: true }
      }),
      fetchEthSupply()
    ])

    // CRITICAL: Always use database ETH price for consistency with dashboard
    // Only use fallback if database is completely unavailable
    const ethPrice = systemMetrics?.ethPrice || 3500
    const ethSupply = liveEthSupply || 120709652 // Live ETH supply from Etherscan, fallback to current estimate
    
    if (!systemMetrics?.ethPrice) {
      console.log('⚠️ WARNING: Using fallback ETH price instead of database value!')
      console.log('⚠️ This causes inconsistency between homepage and dashboard')
    } else {
      console.log('✅ Using database ETH price:', ethPrice)
    }

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
    // Ensure database connection is established (same pattern as working ETF API)
    await prisma.$connect()
    console.log('✅ Database connected for companies data')
    
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
    // Ensure database connection is established (same pattern as working ETF API)
    await prisma.$connect()
    console.log('✅ Database connected for ETF static data')
    
    // Try to fetch ETFs data (table may not exist in production yet)
    let etfs: Array<{ id: number; symbol: string; name: string | null; ethHoldings: number | null; aum: number | null; totalValue: number | null; expenseRatio: number | null; nav: number | null; isActive: boolean; lastUpdated: Date; createdAt: Date }> = []
    try {
      console.log('🔍 Fetching ETF data for static ETF page...')
      etfs = await prisma.etf.findMany({
        where: { isActive: true },
        orderBy: { aum: 'desc' }
      })
      console.log(`✅ Found ${etfs.length} ETFs in database for static ETF data`)
    } catch (error: unknown) {
      console.log('⚠️ ETFs table not found in database, using fallback data:', error instanceof Error ? error.message : 'Unknown error')
      // Use fallback data when database is not available
      return getFallbackStaticEtfData()
    }

    // If database is empty, use fallback data
    if (!etfs || etfs.length === 0) {
      console.log('⚠️ No ETFs in database - using fallback data for static generation')
      return getFallbackStaticEtfData()
    }

    // Get ETH price from system metrics
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' },
      select: { ethPrice: true }
    })
    const ethPrice = systemMetrics?.ethPrice || 3500

    const serializedEtfs = etfs.map((etf) => ({
      id: etf.id,
      symbol: etf.symbol,
      name: etf.name,
      ethHoldings: etf.ethHoldings,
      aum: etf.aum?.toString() || '0',
      totalValue: (etf.ethHoldings || 0) * ethPrice,
      expenseRatio: etf.expenseRatio,
      nav: etf.nav,
      lastUpdated: etf.lastUpdated.toISOString(),
      createdAt: etf.createdAt.toISOString(),
      isActive: etf.isActive
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
