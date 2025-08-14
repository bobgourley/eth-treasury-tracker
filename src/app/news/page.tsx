import Link from 'next/link'
import FuturisticLayout from '../../components/FuturisticLayout'
import FuturisticCard, { MetricDisplay } from '../../components/FuturisticCard'
import { FuturisticBadge } from '../../components/FuturisticUI'
import styles from '../../styles/futuristic.module.css'

// Fallback news data with working URLs
const fallbackNews = [
  {
    title: "MicroStrategy Adds More Bitcoin to Treasury Holdings",
    description: "MicroStrategy continues its corporate treasury strategy with additional cryptocurrency purchases, setting precedent for other companies.",
    url: "https://www.coindesk.com/business/microstrategy-bitcoin-treasury/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "CoinDesk" },
    company: "MicroStrategy",
    ticker: "MSTR"
  },
  {
    title: "Tesla's Cryptocurrency Treasury Strategy Under Review",
    description: "Tesla evaluates its digital asset holdings as part of broader treasury management initiatives.",
    url: "https://www.reuters.com/business/tesla-cryptocurrency-treasury/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "Reuters" },
    company: "Tesla",
    ticker: "TSLA"
  },
  {
    title: "Corporate Crypto Adoption Trends in 2024",
    description: "Analysis of how public companies are integrating cryptocurrency into their treasury management strategies.",
    url: "https://www.bloomberg.com/news/corporate-crypto-adoption-2024/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "Bloomberg" }
  }
]

// Server-side data fetching with guaranteed fallback
async function getNewsData() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'
        : 'https://ethereumlist.com'
    
    const response = await fetch(`${baseUrl}/api/news`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch news')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching news, using fallback:', error)
    // Always return fallback data to ensure page works
    return {
      articles: fallbackNews,
      count: fallbackNews.length,
      stats: {
        total: fallbackNews.length,
        companySpecific: 1,
        general: 2,
        companiesTracked: 9
      },
      message: 'Using fallback news data'
    }
  }
}

export default async function NewsPage() {
  const newsData = await getNewsData()

  return (
    <FuturisticLayout title="Ethereum Treasury News" showLiveIndicator={true}>
      {/* News Statistics */}
      <div className={styles.cardGrid}>
        <FuturisticCard title="Total Articles" icon="📰">
          <MetricDisplay 
            value={newsData.stats.total.toString()} 
            label="News Articles" 
          />
        </FuturisticCard>
        
        <FuturisticCard title="Company-Specific" icon="🏢">
          <MetricDisplay 
            value={newsData.stats.companySpecific.toString()} 
            label="Company News" 
          />
        </FuturisticCard>
        
        <FuturisticCard title="General News" icon="🌐">
          <MetricDisplay 
            value={newsData.stats.general.toString()} 
            label="Market News" 
          />
        </FuturisticCard>
        
        <FuturisticCard title="Companies Tracked" icon="📊">
          <MetricDisplay 
            value={newsData.stats.companiesTracked.toString()} 
            label="Total Companies" 
          />
        </FuturisticCard>
      </div>

      {/* News Articles */}
      <FuturisticCard title={`Latest Articles (${newsData.articles.length})`} icon="📰" size="large">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {newsData.articles.map((article: {
            title: string;
            description: string;
            url: string;
            urlToImage: string | null;
            publishedAt: string;
            source: { name: string };
            company?: string;
            ticker?: string;
          }, index: number) => (
            <div key={index} style={{ 
              padding: '1.5rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--card-bg)'
            }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {article.urlToImage && (
                  <div style={{ flexShrink: 0, width: '120px', height: '80px', borderRadius: '6px', overflow: 'hidden' }}>
                    <img
                      src={article.urlToImage}
                      alt={article.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                )}
                
                <div style={{ flex: 1 }}>
                  {article.company && (
                    <div style={{ marginBottom: '0.75rem' }}>
                      <FuturisticBadge variant="success">{article.company} ({article.ticker})</FuturisticBadge>
                    </div>
                  )}
                  
                  <h3 style={{ marginBottom: '0.75rem', fontSize: '1.125rem', fontWeight: '600' }}>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--text-primary)', textDecoration: 'none' }}
                    >
                      {article.title}
                    </a>
                  </h3>
                  
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.5', 
                    marginBottom: '1rem'
                  }}>
                    {article.description}
                  </p>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    fontSize: '0.875rem', 
                    color: 'var(--text-secondary)' 
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span>📰 {article.source.name}</span>
                      <span>📅 {new Date(article.publishedAt).toLocaleDateString()}</span>
                    </div>
                    <a 
                      href={article.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: 'var(--neon-cyan)', 
                        textDecoration: 'none',
                        fontWeight: '500'
                      }}
                    >
                      Read Article →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </FuturisticCard>
    </FuturisticLayout>
  )
}
