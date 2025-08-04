import React from 'react'
import FuturisticSidebar from '../../components/FuturisticSidebar'
import FuturisticCard, { MetricDisplay, DataList } from '../../components/FuturisticCard'
import { fetchStaticEcosystemData, fetchStaticCompaniesData, fetchStaticETFsData, fetchStaticNewsData, StaticCompanyData, StaticETFData, StaticNewsData } from '../../lib/staticDataFetcher'
import styles from '../../styles/futuristic.module.css'

// This is a server component that uses ISR
export const revalidate = 300 // 5 minutes

export default async function OverviewPage() {
  // Fetch all data server-side
  const [ecosystemData, companiesData, etfsData, newsData] = await Promise.all([
    fetchStaticEcosystemData(),
    fetchStaticCompaniesData(),
    fetchStaticETFsData(),
    fetchStaticNewsData()
  ])

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
