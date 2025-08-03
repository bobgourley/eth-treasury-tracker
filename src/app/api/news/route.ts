import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

interface NewsApiArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    name: string
  }
}

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    name: string
  }
  company?: string
  ticker?: string
}

// Fallback news data
const fallbackNews: NewsArticle[] = [
  {
    title: "Corporate Ethereum Adoption Continues to Grow",
    description: "More companies are adding Ethereum to their treasury reserves as institutional adoption increases.",
    url: "https://example.com/eth-adoption",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "Crypto News" },
    company: "Various"
  },
  {
    title: "Ethereum Treasury Management Best Practices",
    description: "Companies holding ETH are developing sophisticated treasury management strategies.",
    url: "https://example.com/eth-treasury",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "Treasury Today" }
  },
  {
    title: "Institutional Ethereum Holdings Reach New Highs",
    description: "Public companies now hold over $20 billion worth of Ethereum across their balance sheets.",
    url: "https://example.com/eth-holdings",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "Financial Times" }
  }
]

export async function GET() {
  try {
    console.log('📰 Fetching news from database...')
    
    // Fetch news articles from database
    const articles = await prisma.newsArticle.findMany({
      orderBy: { publishedAt: 'desc' },
      take: 20 // Limit to latest 20 articles
    })

    // If database is empty, use fallback
    if (!articles || articles.length === 0) {
      console.log('⚠️ No news articles in database, using fallback data')
      return NextResponse.json({
        articles: fallbackNews,
        count: fallbackNews.length,
        message: 'Using fallback news data - database empty'
      })
    }

    // Convert database articles to API format
    const formattedArticles = articles.map(article => ({
      title: article.title,
      description: article.description || '',
      url: article.url,
      urlToImage: article.imageUrl,
      publishedAt: article.publishedAt.toISOString(),
      source: { name: article.source },
      company: article.companyName,
      ticker: article.companyTicker
    }))

    console.log(`✅ Fetched ${formattedArticles.length} news articles from database`)

    return NextResponse.json({
      articles: formattedArticles,
      count: formattedArticles.length,
      message: 'News data from database'
    })
    
  } catch (error) {
    console.error('❌ Database error, using fallback news data:', error)
    return NextResponse.json({
      articles: fallbackNews,
      count: fallbackNews.length,
      message: 'Database error - using fallback news data'
    })
  }
}
