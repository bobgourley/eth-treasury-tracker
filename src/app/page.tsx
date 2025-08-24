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

    // Fetch news directly from database for homepage (more reliable than internal API call)
    let newsResult: NewsArticle[] = []
    try {
      // First try to get recent cached news from database
      const dbNews = await prisma.newsArticle.findMany({
        where: { 
          isActive: true,
          publishedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        },
        orderBy: { publishedAt: 'desc' },
        take: 5
      })
      
      if (dbNews.length > 0) {
        newsResult = dbNews.map(article => ({
          title: article.title,
          description: article.description || '',
          url: article.url,
          publishedAt: article.publishedAt.toISOString(),
          source: { name: article.sourceName },
          company: article.company,
          ticker: article.ticker
        }))
        console.log(`📰 Homepage: Using ${newsResult.length} cached news articles`)
      } else {
        // If no recent news in database, try to fetch from Google News RSS
        try {
          const { fetchEthereumNewsMultiTopic } = await import('@/lib/googleNewsRss')
          const freshNews = await fetchEthereumNewsMultiTopic(5)
          
          if (freshNews.length > 0) {
            // Save to database and use for homepage
            for (const item of freshNews) {
              await prisma.newsArticle.upsert({
                where: { url: item.url },
                update: {
                  title: item.title,
                  description: item.description,
                  sourceName: item.source,
                  publishedAt: new Date(item.publishedAt),
                  isActive: true
                },
                create: {
                  title: item.title,
                  description: item.description,
                  url: item.url,
                  publishedAt: new Date(item.publishedAt),
                  sourceName: item.source,
                  company: null,
                  ticker: null,
                  isActive: true
                }
              })
            }
            
            newsResult = freshNews.map(item => ({
              title: item.title,
              description: item.description,
              url: item.url,
              publishedAt: item.publishedAt,
              source: { name: item.source },
              company: null,
              ticker: null
            }))
            console.log(`📰 Homepage: Fetched ${newsResult.length} fresh news articles`)
          }
        } catch (newsError) {
          console.error('Failed to fetch fresh news for homepage:', newsError)
        }
      }
    } catch (error) {
      console.error('Failed to fetch news for homepage:', error)
      newsResult = []
    }

    // Get latest system metrics and live data
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })

    // Fetch live crypto market data if system metrics are missing or stale
    let cryptoData = null
    let ethSupply = FALLBACK_ETH_SUPPLY // fallback
    let ethStaked = 32000000 // fallback

    try {
      if (!systemMetrics || (new Date().getTime() - new Date(systemMetrics.lastUpdate).getTime()) > 3600000) {
        // Data is older than 1 hour, fetch fresh data
        cryptoData = await getCryptoMarketData()
        ethSupply = await getTotalEthSupply()
        const stakingData = await getEthStakingData()
        ethStaked = stakingData.stakedEth
      }
    } catch (error) {
      console.error('Failed to fetch live crypto data:', error)
    }

    return {
      companies: companiesResult,
      etfs: etfsResult,
      news: newsResult,
      ethPrice: cryptoData?.ethPrice || systemMetrics?.ethPrice || 0,
      ethSupply: ethSupply,
      bitcoinPrice: cryptoData?.bitcoinPrice || 0,
      bitcoinMarketCap: cryptoData?.bitcoinMarketCap || 1800000000000,
      ethereumMarketCap: cryptoData?.ethMarketCap || 0,
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
