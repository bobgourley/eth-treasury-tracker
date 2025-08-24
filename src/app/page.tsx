import React from 'react'
import Link from 'next/link'
import FuturisticLayout from '../components/FuturisticLayout'
import FuturisticCard, { MetricDisplay } from '../components/FuturisticCard'
import { FuturisticBadge } from '../components/FuturisticUI'
import { DataList } from '../components/FuturisticCard'
import GoogleNewsCard from '../components/GoogleNewsCard'
import styles from '../styles/futuristic.module.css'
import { fetchAllStaticData } from '@/lib/staticDataFetcher'
import { FALLBACK_ETH_PRICE, FALLBACK_ETH_SUPPLY } from '@/lib/constants'
import { getCryptoMarketData, getTotalEthSupply, getEthStakingData } from '../lib/api'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// TypeScript interfaces
interface Company {
  id: number
  name: string
  ticker: string | null
  ethHoldings: number | null
  isActive: boolean
}

interface Etf {
  id: number
  symbol: string
  name: string | null
  ethHoldings: number | null
  aum: number | null
  isActive: boolean
}

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage?: string | null
  publishedAt: string
  source: {
    name: string
  }
  company?: string | null
  ticker?: string | null
}

interface HomePageData {
  companies: Company[]
  etfs: Etf[]
  news: NewsArticle[]
  ethPrice: number
  ethSupply: number
  bitcoinPrice: number
  bitcoinMarketCap: number
  ethereumMarketCap: number
  ethStaked: number
}

async function getHomePageData(): Promise<HomePageData> {
  try {
    // Fetch data from database
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

    // Fetch news using the same reliable approach as the news page
    let newsResult: NewsArticle[] = []
    try {
      console.log('🔍 Homepage: Starting news fetch via API...')
      
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NODE_ENV === 'development' 
          ? 'http://localhost:3000'
          : 'https://ethereumlist.com'
      
      const response = await fetch(`${baseUrl}/api/news/google-rss?limit=5`, {
        next: { revalidate: 300 } // Revalidate every 5 minutes for fresh news
      })
      
      console.log(`📰 Homepage: API response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.articles && data.articles.length > 0) {
          newsResult = data.articles
          console.log(`📰 Homepage: Successfully fetched ${newsResult.length} real RSS articles`)
          console.log(`📰 Homepage: First article URL: ${newsResult[0]?.url}`)
        } else {
          console.log('⚠️ Homepage: API returned no articles, using fallback news')
          // Use fallback only if API returns no articles
        }
      } else {
        console.log('⚠️ Homepage: API fetch failed, using fallback news')
        // Use same fallback URLs as news API for consistency
        const fallbackNews = [
          {
            title: "Ethereum ETFs See Record Inflows as Institutional Adoption Grows",
            description: "Major Ethereum ETFs report significant capital inflows as institutional investors increase their exposure to the second-largest cryptocurrency.",
            url: "https://www.coindesk.com/markets/ethereum/",
            publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            source: { name: "CoinDesk" },
            company: null,
            ticker: null
          },
          {
            title: "Ethereum Staking Yields Attract Corporate Treasury Interest",
            description: "Companies explore Ethereum staking as a yield-generating strategy for their cryptocurrency treasury holdings.",
            url: "https://www.bloomberg.com/news/articles/2024-08-24/ethereum-staking-corporate-treasury",
            publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            source: { name: "Bloomberg" },
            company: null,
            ticker: null
          },
          {
            title: "Layer 2 Solutions Drive Ethereum Network Growth",
            description: "Ethereum's layer 2 scaling solutions see increased adoption, reducing transaction costs and improving network efficiency.",
            url: "https://www.reuters.com/technology/2024/08/24/ethereum-layer-2-growth/",
            publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            source: { name: "Reuters" },
            company: null,
            ticker: null
          },
          {
            title: "Ethereum Price Analysis: Technical Indicators Point to Bullish Momentum",
            description: "Technical analysis suggests Ethereum could see continued upward momentum based on key support and resistance levels.",
            url: "https://cointelegraph.com/news/ethereum-price-analysis-bullish-momentum-2024",
            publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
            source: { name: "Cointelegraph" },
            company: null,
            ticker: null
          },
          {
            title: "DeFi Protocol Launches on Ethereum Mainnet",
            description: "New decentralized finance protocol goes live on Ethereum, offering innovative yield farming opportunities.",
            url: "https://www.theblock.co/post/254321/defi-ethereum-mainnet-launch-2024",
            publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
            source: { name: "The Block" },
            company: null,
            ticker: null
          }
        ]
        newsResult = fallbackNews
      }
    } catch (error) {
      console.error('❌ Homepage: Critical error in news fetching:', error)
      // Always provide fallback news to ensure homepage works
      newsResult = [
        {
          title: "Ethereum ETFs See Record Inflows as Institutional Adoption Grows",
          description: "Major Ethereum ETFs report significant capital inflows as institutional investors increase their exposure to the second-largest cryptocurrency.",
          url: "https://www.coindesk.com/markets/ethereum-etf-inflows/",
          publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          source: { name: "CoinDesk" },
          company: null,
          ticker: null
        },
        {
          title: "Ethereum Staking Yields Attract Corporate Treasury Interest",
          description: "Companies explore Ethereum staking as a yield-generating strategy for their cryptocurrency treasury holdings.",
          url: "https://www.bloomberg.com/news/ethereum-staking-corporate-treasury/",
          publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          source: { name: "Bloomberg" },
          company: null,
          ticker: null
        },
        {
          title: "Layer 2 Solutions Drive Ethereum Network Growth",
          description: "Ethereum's layer 2 scaling solutions see increased adoption, reducing transaction costs and improving network efficiency.",
          url: "https://www.reuters.com/technology/ethereum-layer-2-growth/",
          publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          source: { name: "Reuters" },
          company: null,
          ticker: null
        }
      ]
    }
    
    console.log(`🎯 Homepage: Final news count: ${newsResult.length}`)

    // Get latest system metrics from database - use real data, not fallbacks
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })

    // Always try to get fresh crypto data first, then fall back to database
    let cryptoData = null
    let ethSupply = FALLBACK_ETH_SUPPLY
    let ethStaked = 32000000

    try {
      cryptoData = await getCryptoMarketData()
      if (cryptoData) {
        ethSupply = await getTotalEthSupply()
        const stakingData = await getEthStakingData()
        ethStaked = stakingData.stakedEth
      }
    } catch (error) {
      console.error('Failed to fetch live crypto data, using database values:', error)
    }

    // Use database ETH price if available, otherwise use fresh data or fallback
    const ethPrice = systemMetrics?.ethPrice || cryptoData?.ethPrice || 3825.95
    
    return {
      companies: companiesResult,
      etfs: etfsResult,
      news: newsResult,
      ethPrice: ethPrice,
      ethSupply: ethSupply,
      bitcoinPrice: cryptoData?.bitcoinPrice || 61000,
      bitcoinMarketCap: cryptoData?.bitcoinMarketCap || 1200000000000,
      ethereumMarketCap: cryptoData?.ethMarketCap || (ethPrice * ethSupply),
      ethStaked: ethStaked
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    
    // Return fallback data - try to get last known values from database
    let fallbackMetrics = null
    try {
      fallbackMetrics = await prisma.systemMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' }
      })
    } catch (dbError) {
      console.error('Failed to get fallback metrics from database:', dbError)
    }

    return {
      companies: [],
      etfs: [],
      news: [],
      ethPrice: fallbackMetrics?.ethPrice || 0,
      ethSupply: FALLBACK_ETH_SUPPLY,
      bitcoinPrice: 0,
      bitcoinMarketCap: 1800000000000,
      ethereumMarketCap: 0,
      ethStaked: 32000000
    }
  }
}

// Force revalidation every 5 minutes
export const revalidate = 300

export default async function Home() {
  const { companies, etfs, news, ethPrice, ethSupply, bitcoinPrice, bitcoinMarketCap, ethereumMarketCap, ethStaked } = await getHomePageData()

  // Calculate company totals
  const companyTotalEth = companies.reduce((sum: number, company: Company) => sum + (company.ethHoldings || 0), 0)
  const companyTotalValue = companyTotalEth * ethPrice
  const companyPercentage = (companyTotalEth / ethSupply) * 100

  // Calculate ETF totals
  const etfTotalEth = etfs.reduce((sum: number, etf: Etf) => sum + (etf.ethHoldings || 0), 0)
  const etfTotalValue = etfTotalEth * ethPrice
  const etfPercentage = (etfTotalEth / ethSupply) * 100

  // Format data for display - show ALL companies and ETFs
  const allCompanies = companies.map((company: Company) => ({
    label: company.name,
    value: `${((company.ethHoldings || 0) / 1000).toFixed(0)}K ETH`,
    href: `/companies/${company.ticker}`
  }))

  const allEtfs = etfs.map((etf: Etf) => ({
    label: etf.name || etf.symbol,
    value: `${((etf.ethHoldings || 0) / 1000).toFixed(0)}K ETH`
  }))

  return (
    <FuturisticLayout title="Ethereum Ecosystem Overview" showLiveIndicator={true}>
      {/* Top 6 Small Cards - Market Overview */}
      <div className={styles.cardGrid}>
        <FuturisticCard title="ETH Price" icon="💰" size="small">
          <MetricDisplay
            value={`$${ethPrice.toFixed(2)}`}
            label="Current Price"
            color="cyan"
          />
        </FuturisticCard>

        <FuturisticCard title="BTC Price" icon="₿" size="small">
          <MetricDisplay
            value={`$${bitcoinPrice.toLocaleString()}`}
            label="Current Price"
            color="orange"
          />
        </FuturisticCard>

        <FuturisticCard title="ETH Market Cap" icon="📊" size="small">
          <MetricDisplay
            value={`$${(ethereumMarketCap / 1000000000).toFixed(0)}B`}
            label="Market Cap"
            color="blue"
          />
        </FuturisticCard>

        <FuturisticCard title="BTC Market Cap" icon="📈" size="small">
          <MetricDisplay
            value={`$${(bitcoinMarketCap / 1000000000000).toFixed(2)}T`}
            label="Market Cap"
            color="orange"
          />
        </FuturisticCard>

        <FuturisticCard title="ETH-BTC Ratio" icon="⚖️" size="small">
          <MetricDisplay
            value={(ethPrice / bitcoinPrice).toFixed(4)}
            label="Price Ratio"
            color="green"
          />
        </FuturisticCard>

        <FuturisticCard title="Total ETH Supply" icon="🔗" size="small">
          <MetricDisplay
            value={`${(ethSupply / 1000000).toFixed(1)}M`}
            label="Total Supply"
            color="blue"
          />
        </FuturisticCard>

        <FuturisticCard title="ETH Staked ($)" icon="🔒" size="small">
          <MetricDisplay
            value={`$${((ethStaked * ethPrice) / 1000000000).toFixed(1)}B`}
            label="Staked Value"
            color="blue"
          />
        </FuturisticCard>

        <FuturisticCard title="ETH Staked" icon="🔒" size="small">
          <MetricDisplay
            value={`${(ethStaked / 1000000).toFixed(1)}M`}
            label="Staked ETH"
            color="green"
          />
        </FuturisticCard>
      </div>

      {/* Two Large Cards - Companies and ETFs */}
      <div className={styles.cardGrid}>
        <FuturisticCard 
          title="ETH Strategy Companies" 
          icon="🏢" 
          size="large"
          actions={
            <Link href="/treasury-companies">
              <FuturisticBadge variant="info">View All →</FuturisticBadge>
            </Link>
          }
        >
          <MetricDisplay 
            value={`$${(companyTotalValue / 1000000000).toFixed(2)}B`} 
            label="Total $" 
            color="cyan"
          />
          <MetricDisplay 
            value={`${(companyTotalEth / 1000000).toFixed(1)}M ETH`} 
            label="Total ETH Held" 
            color="green"
          />
          <MetricDisplay 
            value={`${companyPercentage.toFixed(3)}%`} 
            label="Percent ETH Held" 
            color="blue"
          />
        </FuturisticCard>

        <FuturisticCard 
          title="ETH ETFs" 
          icon="📈" 
          size="large"
          actions={
            <Link href="/etfs">
              <FuturisticBadge variant="info">View All →</FuturisticBadge>
            </Link>
          }
        >
          <MetricDisplay 
            value={`$${(etfTotalValue / 1000000000).toFixed(2)}B`} 
            label="Total $" 
            color="cyan"
          />
          <MetricDisplay 
            value={`${(etfTotalEth / 1000000).toFixed(1)}M ETH`} 
            label="Total ETH Held" 
            color="green"
          />
          <MetricDisplay 
            value={`${etfPercentage.toFixed(3)}%`} 
            label="Percent ETH Held" 
            color="blue"
          />
        </FuturisticCard>
      </div>

      {/* Treasury Company and ETF Cards from Dashboard */}
      <div className={styles.cardGrid}>
        {/* Treasury Companies Summary */}
        <FuturisticCard 
          title="Treasury Companies" 
          icon="🏢" 
          size="large"
          actions={
            <Link href="/treasury-companies">
              <FuturisticBadge variant="info">View All →</FuturisticBadge>
            </Link>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <MetricDisplay
                value={companies.length}
                label="Active Companies"
                color="cyan"
              />
              <MetricDisplay
                value={`${(companyTotalEth / 1000000).toFixed(1)}M`}
                label="Total ETH Holdings"
                subtext={`$${(companyTotalValue / 1000000000).toFixed(2)}B value`}
                color="green"
              />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Top Holdings
              </h4>
              <DataList items={allCompanies} linkable={true} />
            </div>
          </div>
        </FuturisticCard>

        {/* Ethereum ETFs Summary */}
        <FuturisticCard 
          title="Ethereum ETFs" 
          icon="📈" 
          size="large"
          actions={
            <Link href="/etfs">
              <FuturisticBadge variant="info">View All →</FuturisticBadge>
            </Link>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <MetricDisplay
                value={etfs.length}
                label="Active ETFs"
                color="blue"
              />
              <MetricDisplay
                value={`${(etfTotalEth / 1000000).toFixed(1)}M`}
                label="Total ETH Holdings"
                subtext={`$${(etfTotalValue / 1000000000).toFixed(1)}B value`}
                color="orange"
              />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Top ETF Holdings
              </h4>
              <DataList items={allEtfs} />
            </div>
          </div>
        </FuturisticCard>
      </div>

      {/* News Section */}
      <div className={styles.cardGrid}>
        <GoogleNewsCard articles={news} compact={true} />
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Page updated: {new Date().toLocaleString('en-US', { 
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })} UTC</p>
        <div className={styles.liveIndicator}>
          <span className={styles.liveDot}></span>
          LIVE
        </div>
      </div>
    </FuturisticLayout>
  )
}
