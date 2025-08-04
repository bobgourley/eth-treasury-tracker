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
    url: "https://www.coindesk.com/business/2024/01/12/corporate-ethereum-adoption-treasury-strategies/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "CoinDesk" },
    company: "Various"
  },
  {
    title: "Ethereum Treasury Management Best Practices",
    description: "Companies holding ETH are developing sophisticated treasury management strategies.",
    url: "https://www.bloomberg.com/news/articles/2024/01/08/ethereum-treasury-management-corporate-strategies/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "Bloomberg" }
  },
  {
    title: "Institutional Ethereum Holdings Reach New Highs",
    description: "Public companies now hold over $20 billion worth of Ethereum across their balance sheets.",
    url: "https://www.theblock.co/post/institutional-ethereum-holdings-record-highs/",
    urlToImage: null,
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    source: { name: "The Block" }
  }
]

export async function GET() {
  try {
    // For now, use fallback data to fix deployment
    // TODO: Fix Prisma NewsArticle model recognition issue
    console.log('📰 Using fallback news data for deployment')
    return NextResponse.json({
      articles: fallbackNews,
      count: fallbackNews.length,
      message: 'Using fallback news data - deployment fix'
    })

  } catch (error) {
    console.error('❌ Error in news API:', error)
    return NextResponse.json({
      articles: fallbackNews,
      count: fallbackNews.length,
      message: 'Using fallback news data due to error'
    })
  }
}
