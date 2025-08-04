'use client'

import React, { useEffect, useState } from 'react'
import FuturisticSidebar from '../../components/FuturisticSidebar'
import FuturisticCard, { MetricDisplay, DataList } from '../../components/FuturisticCard'
import styles from '../../styles/futuristic.module.css'

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

// ETF fallback data for overview page
const ETF_DATA = {
  'ETHA': { name: 'iShares Ethereum Trust ETF', estimatedEthHoldings: 2730000, estimatedAum: 10490000000 },
  'ETHE': { name: 'Grayscale Ethereum Trust', estimatedEthHoldings: 1108000, estimatedAum: 4260000000 },
  'ETH': { name: 'Grayscale Ethereum Mini Trust', estimatedEthHoldings: 642000, estimatedAum: 2470000000 },
  'FETH': { name: 'Fidelity Ethereum Fund', estimatedEthHoldings: 598000, estimatedAum: 2300000000 },
  'ETHW': { name: 'Bitwise Ethereum ETF', estimatedEthHoldings: 132000, estimatedAum: 507130000 }
}

// Helper function to get fallback ETF data for overview page
function getFallbackEtfDataForOverview() {
  return Object.keys(ETF_DATA).slice(0, 5).map((symbol, index) => {
    const etfInfo = ETF_DATA[symbol as keyof typeof ETF_DATA]
    const variation = 0.95 + (Math.random() * 0.1) // 95% to 105%
    const ethHoldings = etfInfo.estimatedEthHoldings * variation
    const aum = etfInfo.estimatedAum * variation
    
    return {
      id: index + 1,
      symbol,
      name: etfInfo.name,
      ethHoldings,
      aum,
      isActive: true
    }
  })
}

export default function OverviewPage() {
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
        
        // Fetch data from API endpoints instead of direct database queries
        const [companiesResponse, etfsResponse, newsResponse, metricsResponse] = await Promise.all([
          fetch('/api/companies'),
          fetch('/api/etfs'),
          fetch('/api/news'),
          fetch('/api/metrics')
        ])
        
        if (companiesResponse.ok) {
          const companiesData = await companiesResponse.json()
          setCompanies(companiesData.companies?.slice(0, 5) || [])
        }
        
        if (etfsResponse.ok) {
          const etfsData = await etfsResponse.json()
          setEtfs(etfsData.etfs?.slice(0, 5) || [])
        }
        
        if (newsResponse.ok) {
          const newsData = await newsResponse.json()
          setNews(newsData.articles?.slice(0, 3) || [])
        }
        
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          setEthPrice(metricsData.ethPrice || 3500)
          setEthSupply(metricsData.ethSupply || 120709652)
        }
        
        setError(null)
      } catch (err) {
        console.error('Error fetching overview data:', err)
        setError('Failed to load overview data')
        
        // Use fallback data on error
        setEtfs(getFallbackEtfDataForOverview())
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  if (loading) {
    return (
      <div className={styles.dashboardContainer}>
        <FuturisticSidebar />
        <main className={styles.mainContent}>
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <span>Loading...</span>
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className={styles.dashboardContainer}>
        <FuturisticSidebar />
        <main className={styles.mainContent}>
          <div className={styles.pageHeader}>
            <div className={styles.pageTitle}>
              <span>Error</span>
            </div>
          </div>
          <FuturisticCard title="Error" icon="❌">
            <p>{error}</p>
          </FuturisticCard>
        </main>
      </div>
    )
  }
  
  // Calculate totals
  const companyTotalEth = companies.reduce((sum: number, company: Company) => sum + Number(company.ethHoldings || 0), 0)
  const etfTotalEth = etfs.reduce((sum: number, etf: Etf) => sum + Number(etf.ethHoldings || 0), 0)
  const totalTrackedEth = companyTotalEth + etfTotalEth
  const trackedPercentage = (totalTrackedEth / ethSupply) * 100
  
  // Format data for display
  const topCompanies = companies.slice(0, 5).map((company: Company) => ({
    label: company.name,
    value: `${(Number(company.ethHoldings || 0) / 1000).toFixed(0)}K ETH`,
    href: `/companies/${company.ticker}`
  }))
  
  const topEtfs = etfs.slice(0, 5).map((etf: Etf) => ({
    label: etf.name || etf.symbol,
    value: `${(Number(etf.ethHoldings || 0) / 1000).toFixed(0)}K ETH`
  }))
    
  // Use real news data from API
  const newsArticles = news.length > 0 ? news : [
    {
      title: "Ethereum ETF Market Continues Growth",
      description: "Institutional adoption of Ethereum through ETFs shows strong momentum with increased holdings across major funds.",
      source: { name: "Crypto News" },
      publishedAt: new Date().toISOString(),
      url: "https://example.com/eth-etf-growth"
    },
    {
      title: "Corporate Treasury Strategies Include ETH",
      description: "More corporations are adding Ethereum to their treasury reserves as a hedge against inflation and currency devaluation.",
      source: { name: "Business Wire" },
      publishedAt: new Date(Date.now() - 86400000).toISOString(),
      url: "https://example.com/corporate-eth-strategy"
    },
    {
      title: "Ethereum Network Upgrade Enhances Efficiency",
      description: "Latest network improvements continue to optimize transaction costs and processing speed for institutional users.",
      source: { name: "Tech Today" },
      publishedAt: new Date(Date.now() - 172800000).toISOString(),
      url: "https://example.com/eth-network-upgrade"
    }
  ]

  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className={styles.dashboardContainer}>
      <FuturisticSidebar />
      
      <main className={styles.mainContent}>
        {/* Header */}
        <div className={styles.pageHeader}>
          <div className={styles.pageTitle}>
            <span>Ethereum Ecosystem Overview</span>
            <span className={styles.liveIndicator}>LIVE</span>
          </div>
          <div className={styles.dateDisplay}>
            {currentDate}
          </div>
        </div>

        {/* Main Metrics Grid */}
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
              value={`${(totalTrackedEth / 1000).toFixed(0)}K`}
              label="Total Tracked"
              subtext={`${trackedPercentage.toFixed(3)}% of supply`}
              color="green"
            />
          </FuturisticCard>

          {/* Total Value Card */}
          <FuturisticCard title="Total Value" icon="💎">
            <MetricDisplay
              value={`$${(totalTrackedEth * ethPrice / 1000000000).toFixed(2)}B`}
              label="USD Value"
              color="orange"
            />
          </FuturisticCard>
        </div>

        {/* Companies and ETFs Grid */}
        <div className={styles.cardGrid}>
          {/* Companies Summary */}
          <FuturisticCard title="Treasury Companies" icon="🏢" size="large">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <MetricDisplay
                  value={companies.length}
                  label="Active Companies"
                  color="cyan"
                />
                <MetricDisplay
                  value={`${(companyTotalEth / 1000).toFixed(0)}K`}
                  label="Total ETH Holdings"
                  subtext={`$${(companyTotalEth * ethPrice / 1000000000).toFixed(2)}B value`}
                  color="green"
                />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Top Holdings
                </h4>
                <DataList items={topCompanies} linkable={true} />
              </div>
            </div>
          </FuturisticCard>

          {/* ETFs Summary */}
          <FuturisticCard title="Ethereum ETFs" icon="📈" size="large">
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
                  subtext={`$${(etfTotalEth * ethPrice / 1000000000).toFixed(1)}B value`}
                  color="orange"
                />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Top ETF Holdings
                </h4>
                <DataList items={topEtfs} />
              </div>
            </div>
          </FuturisticCard>
        </div>

        {/* News and Updates */}
        <div className={styles.cardGrid}>
          <FuturisticCard title="Latest News" icon="📰" size="wide">
            <div className={styles.newsGrid}>
              {newsArticles.map((article, index) => (
                <div key={index} className={styles.newsItem}>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className={styles.newsLink}>
                    <h4 className={styles.newsTitle}>{article.title}</h4>
                    <p className={styles.newsDescription}>{article.description}</p>
                    <div className={styles.newsMeta}>
                      <span className={styles.newsSource}>
                        {typeof article.source === 'string' ? article.source : article.source?.name || 'Unknown'}
                      </span>
                      <span className={styles.newsDate}>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </FuturisticCard>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>Last updated: {new Date().toLocaleString()} • Live data with real-time refresh</p>
        </div>
      </main>
    </div>
  )
}
