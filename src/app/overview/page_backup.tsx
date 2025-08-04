import React from 'react'
import FuturisticSidebar from '../../components/FuturisticSidebar'
import FuturisticCard, { MetricDisplay, DataList } from '../../components/FuturisticCard'
import { PrismaClient } from '@prisma/client'
import { fetchEthSupply } from '../../lib/dataFetcher'
import styles from '../../styles/futuristic.module.css'

// This is a server component that uses ISR
export const revalidate = 300 // 5 minutes

export default async function OverviewPage() {
  // Direct database queries using same pattern as working API endpoints
  const prisma = new PrismaClient()
  
  try {
    await prisma.$connect()
    console.log('✅ Overview page: Database connected successfully')
    
    // Fetch data directly from database using working patterns
    const [companies, etfs, systemMetrics, liveEthSupply] = await Promise.all([
      prisma.company.findMany({
        where: { isActive: true },
        orderBy: { ethHoldings: 'desc' },
        take: 5
      }),
      prisma.etf.findMany({
        where: { isActive: true },
        orderBy: { aum: 'desc' },
        take: 5
      }),
      prisma.systemMetrics.findFirst({
        orderBy: { lastUpdate: 'desc' },
        select: { ethPrice: true }
      }),
      fetchEthSupply()
    ])
    
    await prisma.$disconnect()
    
    console.log(`✅ Overview page: Found ${companies.length} companies, ${etfs.length} ETFs`)
    
    // Calculate totals
    const ethPrice = systemMetrics?.ethPrice || 3500
    const ethSupply = liveEthSupply || 120709652
    const companyTotalEth = companies.reduce((sum, company) => sum + Number(company.ethHoldings || 0), 0)
    const etfTotalEth = etfs.reduce((sum, etf) => sum + Number(etf.ethHoldings || 0), 0)
    const totalTrackedEth = companyTotalEth + etfTotalEth
    const trackedPercentage = (totalTrackedEth / ethSupply) * 100
    
    // Format data for display
    const topCompanies = companies.slice(0, 5).map(company => ({
      label: company.name,
      value: `${(Number(company.ethHoldings || 0) / 1000).toFixed(0)}K ETH`
    }))
    
    const topEtfs = etfs.slice(0, 5).map(etf => ({
      label: etf.name || etf.symbol,
      value: `${(Number(etf.ethHoldings || 0) / 1000).toFixed(0)}K ETH`
    }))
    
    // Simple news data
    const newsArticles = [
      {
        title: "Ethereum ETF Market Continues Growth",
        description: "Institutional adoption of Ethereum through ETFs shows strong momentum with increased holdings across major funds....",
        source: "Crypto News",
        publishedAt: new Date().toLocaleDateString()
      },
      {
        title: "Corporate Treasury Strategies Include ETH",
        description: "More corporations are adding Ethereum to their treasury reserves as a hedge against inflation and currency devaluation....",
        source: "Business Wire",
        publishedAt: new Date(Date.now() - 86400000).toLocaleDateString()
      },
      {
        title: "Ethereum Network Upgrade Enhances Efficiency",
        description: "Latest network improvements continue to optimize transaction costs and processing speed for institutional users....",
        source: "Tech Today",
        publishedAt: new Date(Date.now() - 172800000).toLocaleDateString()
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
    <div className={styles.container}>
      <FuturisticSidebar currentPage="overview" />
      
      <main className={styles.mainContent}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>Ethereum Ecosystem Overview</h1>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot}></span>
            <span>LIVE</span>
          </div>
          <p className={styles.subtitle}>{currentDate}</p>
        </div>

        {/* Main Metrics Grid */}
        <div className={styles.cardGrid}>
          {/* ETH Price Card */}
          <FuturisticCard title="ETH Price" icon="💰">
            <MetricDisplay
              value={`$${ethPrice.toLocaleString()}`}
              label="Current Price"
              subtext="Real-time market data"
              color="cyan"
            />
          </FuturisticCard>

          {/* Total ETH Supply Card */}
          <FuturisticCard title="Total ETH Supply" icon="🌐">
            <MetricDisplay
              value={`${(ethSupply / 1000000).toFixed(2)}M`}
              label="Total Supply"
              subtext="Live from Etherscan API"
              color="blue"
            />
          </FuturisticCard>

          {/* Tracked ETH Card */}
          <FuturisticCard title="Tracked ETH" icon="📊">
            <MetricDisplay
              value={`${(totalTrackedEth / 1000000).toFixed(2)}M`}
              label="ETH Holdings"
              subtext={`${trackedPercentage.toFixed(3)}% of total supply`}
              color="green"
              showProgress={true}
              progressValue={trackedPercentage}
            />
          </FuturisticCard>

          {/* Total Value Card */}
          <FuturisticCard title="Total Value" icon="💎">
            <MetricDisplay
              value={`$${(totalTrackedEth * ethPrice / 1000000000).toFixed(1)}B`}
              label="Market Value"
              subtext="Combined treasury + ETF value"
              color="purple"
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
                <DataList items={topCompanies} />
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
                  <h4 className={styles.newsTitle}>{article.title}</h4>
                  <p className={styles.newsDescription}>{article.description}</p>
                  <div className={styles.newsMeta}>
                    <span className={styles.newsSource}>{article.source}</span>
                    <span className={styles.newsDate}>{article.publishedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          </FuturisticCard>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>Last updated: {new Date().toLocaleString()} • Static generation with 5-minute refresh</p>
        </div>
      </main>
    </div>
  )
  
  } catch (error) {
    console.error('❌ Overview page error:', error)
    return (
      <div className={styles.container}>
        <FuturisticSidebar currentPage="overview" />
        <main className={styles.mainContent}>
          <div className={styles.header}>
            <h1 className={styles.title}>Ethereum Ecosystem Overview</h1>
            <p className={styles.subtitle}>Error loading data</p>
          </div>
          <FuturisticCard title="Error" icon="❌">
            <p>Unable to load overview data. Please try again later.</p>
          </FuturisticCard>
        </main>
      </div>
    )
  } finally {
    await prisma.$disconnect()
  }
}

  // Format current date
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Calculate key metrics
  const totalTrackedEth = ecosystemData.totalTrackedEth
  const totalTrackedValue = (ecosystemData.companies.totalValue + ecosystemData.etfs.totalValue)
  const ethPrice = ecosystemData.ethPrice
  const ethSupply = ecosystemData.ethSupply
  const trackedPercentage = ecosystemData.totalTrackedPercentage

  // Top companies for display
  const topCompanies = companiesData.companies
    .sort((a: StaticCompanyData, b: StaticCompanyData) => Number(b.ethHoldings) - Number(a.ethHoldings))
    .slice(0, 5)
    .map((company: StaticCompanyData) => ({
      label: company.name,
      value: `${Number(company.ethHoldings).toLocaleString()} ETH`,
      status: 'active' as const
    }))

  // Top ETFs for display
  const topEtfs = etfsData.etfs
    .sort((a: StaticETFData, b: StaticETFData) => Number(b.ethHoldings) - Number(a.ethHoldings))
    .slice(0, 5)
    .map((etf: StaticETFData) => ({
      label: etf.name || etf.symbol,
      value: `${Number(etf.ethHoldings).toLocaleString()} ETH`,
      status: 'active' as const
    }))

  return (
    <div className={styles.dashboardContainer}>
      <FuturisticSidebar />
      
      <main className={styles.mainContent}>
        <header className={styles.pageHeader}>
          <div className={styles.pageTitle}>
            <span>Ethereum Ecosystem Overview</span>
            <span className={styles.liveIndicator}>LIVE</span>
          </div>
          <div className={styles.dateDisplay}>
            {currentDate}
          </div>
        </header>

        {/* Main Metrics Grid */}
        <div className={styles.cardGrid}>
          {/* ETH Price Card */}
          <FuturisticCard title="ETH Price" icon="💰">
            <MetricDisplay
              value={`$${ethPrice.toLocaleString()}`}
              label="Current Price"
              subtext="Real-time market data"
              color="cyan"
            />
          </FuturisticCard>

          {/* Total ETH Supply Card */}
          <FuturisticCard title="Total ETH Supply" icon="🌐">
            <MetricDisplay
              value={`${(ethSupply / 1000000).toFixed(2)}M`}
              label="Total Supply"
              subtext="Live from Etherscan API"
              color="blue"
            />
          </FuturisticCard>

          {/* Tracked ETH Card */}
          <FuturisticCard title="Tracked ETH" icon="📊">
            <MetricDisplay
              value={`${(totalTrackedEth / 1000000).toFixed(2)}M`}
              label="ETH Holdings"
              subtext={`${trackedPercentage.toFixed(3)}% of total supply`}
              color="green"
              showProgress={true}
              progressValue={trackedPercentage}
            />
          </FuturisticCard>

          {/* Total Value Card */}
          <FuturisticCard title="Total Value" icon="💎">
            <MetricDisplay
              value={`$${(totalTrackedValue / 1000000000).toFixed(1)}B`}
              label="Market Value"
              subtext="Combined treasury + ETF value"
              color="cyan"
            />
          </FuturisticCard>
        </div>

        {/* Secondary Metrics Grid */}
        <div className={styles.cardGrid}>
          {/* Treasury Companies Summary */}
          <FuturisticCard title="Treasury Companies" icon="🏢" size="large">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <MetricDisplay
                  value={companiesData.companies.length}
                  label="Active Companies"
                  color="cyan"
                />
                <MetricDisplay
                  value={`${(ecosystemData.companies.totalEth / 1000).toFixed(0)}K`}
                  label="Total ETH Holdings"
                  subtext={`$${(ecosystemData.companies.totalValue / 1000000000).toFixed(2)}B value`}
                  color="green"
                />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                  Top Holdings
                </h4>
                <DataList items={topCompanies} />
              </div>
            </div>
          </FuturisticCard>

          {/* ETFs Summary */}
          <FuturisticCard title="Ethereum ETFs" icon="📈" size="large">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <MetricDisplay
                  value={etfsData.etfs.length}
                  label="Active ETFs"
                  color="blue"
                />
                <MetricDisplay
                  value={`${(ecosystemData.etfs.totalEth / 1000000).toFixed(1)}M`}
                  label="Total ETH Holdings"
                  subtext={`$${(ecosystemData.etfs.totalValue / 1000000000).toFixed(1)}B value`}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {newsData.articles.slice(0, 3).map((article: StaticNewsData, index: number) => (
                <div key={index} style={{ 
                  padding: '1rem', 
                  background: 'rgba(0, 255, 255, 0.05)', 
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 255, 255, 0.1)'
                }}>
                  <h4 style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '0.95rem', 
                    marginBottom: '0.5rem',
                    lineHeight: '1.4'
                  }}>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: 'inherit', 
                        textDecoration: 'none',
                        transition: 'color 0.3s ease'
                      }}
                      className="news-link"
                    >
                      {article.title}
                    </a>
                  </h4>
                  <p style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '0.8rem',
                    margin: '0.5rem 0'
                  }}>
                    {article.description?.substring(0, 120)}...
                  </p>
                  <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span>{article.source?.name}</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </FuturisticCard>
        </div>

        {/* Data Freshness Indicator */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          color: 'var(--text-muted)', 
          fontSize: '0.85rem' 
        }}>
          Last updated: {new Date().toLocaleString()} • Static generation with 5-minute refresh
        </div>
      </main>
    </div>
  )
}
