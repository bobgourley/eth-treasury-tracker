import React from 'react'
import FuturisticLayout from '@/components/FuturisticLayout'
import FuturisticCard, { MetricDisplay, DataList } from '@/components/FuturisticCard'
import { FuturisticBadge } from '@/components/FuturisticUI'
import Link from 'next/link'
import styles from '@/styles/futuristic.module.css'

// TypeScript interfaces
interface Company {
  id: number
  name: string
  ticker: string
  ethHoldings: number
  isActive: boolean
}

interface Etf {
  id: number
  symbol: string
  name: string
  ethHoldings: number
  aum: number
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
  } | string
  company?: string
  ticker?: string
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
}

async function getHomePageData(): Promise<HomePageData> {
  try {
    // Fetch data from API endpoints on the server
    const [companiesResponse, etfsResponse, newsResponse, metricsResponse] = await Promise.all([
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/companies`, { cache: 'no-store' }),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/etfs`, { cache: 'no-store' }),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/news`, { cache: 'no-store' }),
      fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/metrics`, { cache: 'no-store' })
    ])
    
    const [companiesData, etfsData, newsData, metricsData] = await Promise.all([
      companiesResponse.ok ? companiesResponse.json() : { companies: [] },
      etfsResponse.ok ? etfsResponse.json() : { etfs: [] },
      newsResponse.ok ? newsResponse.json() : { articles: [] },
      metricsResponse.ok ? metricsResponse.json() : { ethPrice: 3500, totalEthSupply: 120709652 }
    ])

    // Fetch Bitcoin and crypto market data from CoinGecko
    let bitcoinPrice = 95000
    let bitcoinMarketCap = 1800000000000 // $1.8T
    let ethereumMarketCap = 420000000000 // $420B
    
    try {
      const cryptoResponse = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_market_cap=true',
        { cache: 'no-store' }
      )
      
      if (cryptoResponse.ok) {
        const cryptoData = await cryptoResponse.json()
        bitcoinPrice = cryptoData.bitcoin?.usd || bitcoinPrice
        bitcoinMarketCap = cryptoData.bitcoin?.usd_market_cap || bitcoinMarketCap
        ethereumMarketCap = cryptoData.ethereum?.usd_market_cap || ethereumMarketCap
      }
    } catch (cryptoError) {
      console.error('Error fetching crypto market data:', cryptoError)
    }

    return {
      companies: companiesData.companies || [],
      etfs: etfsData.etfs || [],
      news: newsData.articles?.slice(0, 3) || [],
      ethPrice: metricsData.ethPrice || 3500,
      ethSupply: metricsData.totalEthSupply || metricsData.ethSupply || 120709652,
      bitcoinPrice,
      bitcoinMarketCap,
      ethereumMarketCap
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error)
    // Return fallback data
    return {
      companies: [],
      etfs: [],
      news: [],
      ethPrice: 3500,
      ethSupply: 120709652,
      bitcoinPrice: 95000,
      bitcoinMarketCap: 1800000000000,
      ethereumMarketCap: 420000000000
    }
  }
}

export default async function Home() {
  const { companies, etfs, news, ethPrice, ethSupply, bitcoinPrice, bitcoinMarketCap, ethereumMarketCap } = await getHomePageData()

  // Calculate totals and metrics
  const totalEthTracked = companies.reduce((sum: number, company: Company) => sum + (company.ethHoldings || 0), 0) + 
                          etfs.reduce((sum: number, etf: Etf) => sum + (etf.ethHoldings || 0), 0)
  const totalValueUsd = totalEthTracked * ethPrice
  const trackedPercentage = (totalEthTracked / ethSupply) * 100

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

  const recentNews = news.slice(0, 3)

  return (
    <FuturisticLayout title="Ethereum Ecosystem Overview" showLiveIndicator={true}>
      {/* Companies and ETFs Grid - Moved to Top */}
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
          <MetricDisplay 
            value={`${(companies.reduce((sum: number, c: Company) => sum + (c.ethHoldings || 0), 0) / 1000000).toFixed(1)}M ETH`} 
            label="Total Holdings" 
          />
          <MetricDisplay 
            value={`${companies.length}`} 
            label="Companies" 
          />
          <DataList items={allCompanies} />
        </FuturisticCard>

        {/* ETH ETF Summary */}
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
            value={`${(etfs.reduce((sum: number, e: Etf) => sum + (e.ethHoldings || 0), 0) / 1000000).toFixed(1)}M ETH`} 
            label="Total Holdings" 
          />
          <MetricDisplay 
            value={`${etfs.length}`} 
            label="ETFs" 
          />
          <DataList items={allEtfs} />
        </FuturisticCard>
      </div>

      {/* Main Metrics Grid - Moved Below Lists */}
      <div className={styles.cardGrid}>
        {/* ETH Price Card */}
        <FuturisticCard title="ETH Price" icon="💰">
          <MetricDisplay
            value={`$${ethPrice.toFixed(2)}`}
            label="Current Price"
            color="cyan"
          />
        </FuturisticCard>

        {/* Total Supply Card */}
        <FuturisticCard title="ETH Supply" icon="🔗">
          <MetricDisplay
            value={`${(ethSupply / 1000000).toFixed(1)}M`}
            label="Total Supply"
            color="blue"
          />
        </FuturisticCard>

        {/* Tracked ETH Card */}
        <FuturisticCard title="Tracked ETH" icon="📊">
          <MetricDisplay
            value={`${(totalEthTracked / 1000).toFixed(0)}K`}
            label="Total Tracked"
            subtext={`${trackedPercentage.toFixed(3)}% of supply`}
            color="green"
          />
        </FuturisticCard>

        {/* ETH and Treasury Reserves Card */}
        <FuturisticCard title="ETH and Treasury Reserves" icon="💎">
          <MetricDisplay
            value={`$${(totalValueUsd / 1000000000).toFixed(2)}B`}
            label="USD Value"
            color="orange"
          />
        </FuturisticCard>

        {/* Token Market Cap Card */}
        <FuturisticCard title="Token Market Cap" icon="💰" size="large">
          <MetricDisplay 
            value={`$${(bitcoinMarketCap / 1000000000000).toFixed(2)}T`}
            label="Bitcoin Market Cap" 
            color="orange"
          />
          <MetricDisplay 
            value={`$${(ethereumMarketCap / 1000000000).toFixed(0)}B`}
            label="Ethereum Market Cap" 
            color="blue"
          />
        </FuturisticCard>

        {/* ETH-BTC Ratio */}
        <FuturisticCard title="ETH-BTC" icon="⚖️" size="large">
          <MetricDisplay 
            value={(ethPrice / bitcoinPrice).toFixed(4)}
            label="ETH/BTC Ratio" 
            color="cyan"
          />
          <MetricDisplay 
            value={`$${bitcoinPrice.toLocaleString()}`}
            label="Bitcoin Price" 
            color="orange"
          />
        </FuturisticCard>
      </div>

      {/* News and Updates */}
      <div className={styles.cardGrid}>
        <FuturisticCard 
          title="Latest Ethereum News" 
          icon="📰" 
          size="wide"
          actions={
            <Link href="/news">
              <FuturisticBadge variant="info">View All →</FuturisticBadge>
            </Link>
          }
        >
          <div className={styles.newsGrid}>
            {recentNews.map((article: NewsArticle, index: number) => (
              <div key={index} className={styles.newsItem}>
                <h4>
                  <a href={article.url} target="_blank" rel="noopener noreferrer">
                    {article.title}
                  </a>
                </h4>
                <p>{article.description}</p>
                <div className={styles.newsMetadata}>
                  <span>{typeof article.source === 'string' ? article.source : article.source.name}</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </FuturisticCard>
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
