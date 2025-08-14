'use client'

import React, { useEffect, useState } from 'react'
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

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [etfs, setEtfs] = useState<Etf[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])
  const [ethPrice, setEthPrice] = useState<number>(3500)
  const [ethSupply, setEthSupply] = useState<number>(120709652)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch data from API endpoints - SAME AS DASHBOARD
        const [companiesResponse, etfsResponse, newsResponse, metricsResponse] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/etfs'),
          fetch('/api/news'),
          fetch('/api/metrics')
        ])
        
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json()
          setCompanies(companiesData.companies || [])
        }
        
        if (etfsResponse.ok) {
          const etfsData = await etfsResponse.json()
          setEtfs(etfsData.etfs || [])
        }
        
        if (newsResponse.ok) {
          const newsData = await newsResponse.json()
          setNews(newsData.articles?.slice(0, 3) || [])
        }
        
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          console.log('📊 Homepage ETH price from /api/metrics:', metricsData.ethPrice)
          setEthPrice(metricsData.ethPrice || 3500)
          setEthSupply(metricsData.totalEthSupply || metricsData.ethSupply || 120709652)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching homepage data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <FuturisticLayout title="Ethereum Ecosystem" showLiveIndicator={true}>
        <FuturisticCard title="Loading..." icon="⏳">
          <div className="text-center">
            <p>Loading ecosystem data...</p>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }

  if (error) {
    return (
      <FuturisticLayout title="Ethereum Ecosystem" showLiveIndicator={true}>
        <FuturisticCard title="Error" icon="❌" variant="warning">
          <div className="text-center">
            <p>{error}</p>
            <p className="text-sm mt-1">Please try refreshing the page</p>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }

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
            value="Loading..." 
            label="Bitcoin Market Cap" 
          />
          <MetricDisplay 
            value="Loading..." 
            label="Ethereum Market Cap" 
          />
        </FuturisticCard>

        {/* ETH-BTC Ratio */}
        <FuturisticCard title="ETH-BTC" icon="⚖️" size="large">
          <MetricDisplay 
            value="Loading..." 
            label="ETH/BTC Ratio" 
          />
          <MetricDisplay 
            value="Loading..." 
            label="Bitcoin Price" 
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
        <p>Page generated: {new Date(staticData.generatedAt).toLocaleString('en-US', { 
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })} UTC •{' '}
        <FuturisticBadge variant="live" size="small" pulse>Statically Generated</FuturisticBadge>
        {' '}• Auto-refreshes every 5 minutes</p>
        <p style={{ marginTop: '1rem' }}>© 2025 Ethereum List. Comprehensive Ethereum ecosystem tracking.</p>
        <p style={{ marginTop: '0.5rem' }}>
          Data sourced from public APIs, CoinGecko, EtherScan, Alpha Vantage, Financial Modeling Prep, and NewsAPI.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Built with Next.js, Tailwind CSS, and Prisma. 
          <Link href="/sitemap.xml" style={{ color: 'var(--neon-cyan)', marginLeft: '0.5rem' }}>Sitemap</Link>
        </p>
      </div>
    </FuturisticLayout>
  )
}
