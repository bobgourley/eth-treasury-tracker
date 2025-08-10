import FuturisticLayout from '@/components/FuturisticLayout'
import FuturisticCard, { MetricDisplay, DataList } from '@/components/FuturisticCard'
import { FuturisticBadge } from '@/components/FuturisticUI'
import Link from 'next/link'
import { fetchAllStaticData, StaticPageData } from '@/lib/staticDataFetcher'
import styles from '@/styles/futuristic.module.css'

export async function generateMetadata() {
  return {
    title: 'EthereumList.com - Comprehensive Ethereum Ecosystem Tracker',
    description: 'Track Ethereum ETFs, treasury companies, ecosystem statistics, and news. Comprehensive data on corporate ETH holdings, market metrics, and institutional adoption.',
    keywords: ['ethereum', 'ETF', 'treasury companies', 'corporate ETH holdings', 'institutional crypto', 'ethereum ecosystem'],
    openGraph: {
      title: 'EthereumList.com - Ethereum Ecosystem Tracker',
      description: 'Comprehensive tracking of Ethereum ETFs, treasury companies, and ecosystem data',
      type: 'website',
    },
  }
}

// Enable static generation with revalidation for App Router
export const revalidate = 300 // Revalidate every 5 minutes

export default async function Home() {
  let staticData: StaticPageData | null = null
  
  try {
    console.log('🔄 Generating static data for homepage...')
    staticData = await fetchAllStaticData()
  } catch (error) {
    console.error('❌ Error fetching static data:', error)
  }
  
  // If static data failed to load, show error message
  if (!staticData) {
    return (
      <FuturisticLayout title="Ethereum Ecosystem" showLiveIndicator={true}>
        <FuturisticCard title="Error" icon="❌" variant="warning">
          <div className="text-center">
            <p>Failed to load static data</p>
            <p className="text-sm mt-1">Please try refreshing the page</p>
          </div>
        </FuturisticCard>
      </FuturisticLayout>
    )
  }
  // Calculate totals and metrics
  const totalEthTracked = staticData.ecosystem.totalTrackedEth
  const ethPrice = staticData.ecosystem.ethPrice
  const ethSupply = staticData.ecosystem.ethSupply
  const totalValueUsd = totalEthTracked * ethPrice
  const trackedPercentage = (totalEthTracked / ethSupply) * 100

  // Format data for display - show ALL companies and ETFs
  const allCompanies = staticData.companies.companies.map(company => ({
    label: company.name,
    value: `${((company.ethHoldings || 0) / 1000).toFixed(0)}K ETH`,
    href: `/companies/${company.ticker}`
  }))

  const allEtfs = staticData.etfs.etfs.map(etf => ({
    label: etf.name || etf.symbol,
    value: `${((etf.ethHoldings || 0) / 1000).toFixed(0)}K ETH`
  }))

  const recentNews = staticData.news.articles.slice(0, 3)

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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <MetricDisplay
                value={staticData.companies.companies.length}
                label="Active Companies"
                color="cyan"
              />
              <MetricDisplay
                value={`${(staticData.companies.companies.reduce((sum, c) => sum + (c.ethHoldings || 0), 0) / 1000000).toFixed(1)}M`}
                label="Total ETH Holdings"
                subtext={`$${(staticData.companies.companies.reduce((sum, c) => sum + (c.ethHoldings || 0), 0) * ethPrice / 1000000000).toFixed(2)}B value`}
                color="green"
              />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                All Holdings
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
                value={staticData.etfs.etfs.length}
                label="Active ETFs"
                color="blue"
              />
              <MetricDisplay
                value={`${(staticData.etfs.etfs.reduce((sum, e) => sum + (e.ethHoldings || 0), 0) / 1000000).toFixed(1)}M`}
                label="Total ETH Holdings"
                subtext={`$${(staticData.etfs.etfs.reduce((sum, e) => sum + (e.ethHoldings || 0), 0) * ethPrice / 1000000000).toFixed(1)}B value`}
                color="orange"
              />
            </div>
            <div>
              <h4 style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                All ETF Holdings
              </h4>
              <DataList items={allEtfs} />
            </div>
          </div>
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
        <FuturisticCard title="Token Market Cap" icon="🪙">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <MetricDisplay
              value={`$${((ethPrice * ethSupply) / 1000000000000).toFixed(2)}T`}
              label="ETH Market Cap"
              color="cyan"
            />
            <MetricDisplay
              value="$2.1T"
              label="BTC Market Cap"
              subtext="Estimated"
              color="orange"
            />
          </div>
        </FuturisticCard>

        {/* ETH-BTC Ratio Card */}
        <FuturisticCard title="ETH-BTC Ratio" icon="⚖️">
          <MetricDisplay
            value={`${(ethPrice / 105000).toFixed(3)}`}
            label="ETH/BTC Price Ratio"
            subtext={`1 BTC = ${(105000 / ethPrice).toFixed(1)} ETH`}
            color="blue"
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
            {recentNews.map((article, index) => (
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
        <p>Page generated: {new Date(staticData.generatedAt).toLocaleString('en-US', { 
          timeZone: 'UTC',
          year: 'numeric',
          month: '2-digit', 
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        })} UTC • <FuturisticBadge variant="live" size="small" pulse>Statically Generated</FuturisticBadge> • Auto-refreshes every 5 minutes</p>
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
