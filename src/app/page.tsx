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
