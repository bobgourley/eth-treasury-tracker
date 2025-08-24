import Link from 'next/link'
import FuturisticLayout from '../../components/FuturisticLayout'
import FuturisticCard, { MetricDisplay } from '../../components/FuturisticCard'
import GoogleNewsCard from '../../components/GoogleNewsCard'
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

// Server-side data fetching from Google News RSS
async function getNewsData() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000'
        : 'https://ethereumlist.com'
    
    const response = await fetch(`${baseUrl}/api/news/google-rss?limit=20`, {
      next: { revalidate: 1800 } // Revalidate every 30 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch Google News RSS')
    }
    
    const data = await response.json()
    return {
      articles: data.articles || [],
      count: data.count || 0,
      stats: {
        total: data.count || 0,
        companySpecific: 0,
        general: data.count || 0,
        companiesTracked: 9
      },
      message: data.success ? 'Live Google News RSS data' : 'Cached news data'
    }
  } catch (error) {
    console.error('Error fetching Google News RSS, using fallback:', error)
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
      {/* News Articles */}
      <div className={styles.cardGrid}>
        <GoogleNewsCard 
          articles={newsData.articles} 
          title={`Latest Ethereum News (${newsData.articles.length})`}
          showViewAll={false}
          compact={false}
        />
      </div>
    </FuturisticLayout>
  )
}
