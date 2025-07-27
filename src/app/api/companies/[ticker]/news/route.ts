import { NextRequest, NextResponse } from 'next/server'

interface NewsArticle {
  title: string
  description: string
  url: string
  urlToImage: string | null
  publishedAt: string
  source: {
    id: string | null
    name: string
  }
  content: string | null
}

interface NewsAPIResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params
  
  if (!ticker) {
    return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 })
  }

  try {

    const newsApiKey = process.env.NEWS_API_KEY
    
    if (!newsApiKey) {
      console.log('NEWS_API_KEY not configured, returning empty news array')
      return NextResponse.json({
        ticker: ticker.toUpperCase(),
        articles: [],
        message: 'News API not configured',
        lastUpdate: new Date().toISOString()
      })
    }

    // Get company name mapping for better search results
    const companyNames: { [key: string]: string } = {
      'BTCS': 'BTCS Inc',
      'BITF': 'Bitfarms',
      'BTCM': 'BTC Digital',
      'GSQD': 'GameSquare Holdings',
      'SLGD': 'SharpLink Gaming',
      'BIMI': 'BitMine Immersion Technologies',
      'EXOD': 'Exodus Movement',
      'INTC': 'Intchains Group',
      'KR1': 'KR1 plc'
    }

    const companyName = companyNames[ticker.toUpperCase()] || ticker.toUpperCase()
    
    // Search for news articles about the company
    const searchQuery = `"${companyName}" OR "${ticker.toUpperCase()}" crypto OR ethereum OR bitcoin`
    
    const newsResponse = await fetch(
      `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `sortBy=publishedAt&` +
      `pageSize=10&` +
      `language=en&` +
      `apiKey=${newsApiKey}`,
      {
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!newsResponse.ok) {
      throw new Error(`NewsAPI request failed: ${newsResponse.status}`)
    }

    const newsData: NewsAPIResponse = await newsResponse.json()
    
    // Filter articles to ensure they're relevant to the company
    const relevantArticles = newsData.articles.filter(article => {
      const titleLower = article.title.toLowerCase()
      const descriptionLower = (article.description || '').toLowerCase()
      const companyLower = companyName.toLowerCase()
      const tickerLower = ticker.toLowerCase()
      
      return titleLower.includes(companyLower) || 
             titleLower.includes(tickerLower) ||
             descriptionLower.includes(companyLower) ||
             descriptionLower.includes(tickerLower)
    })

    // Sort by published date (most recent first)
    relevantArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      companyName,
      articles: relevantArticles.slice(0, 5), // Return top 5 most relevant articles
      totalResults: relevantArticles.length,
      lastUpdate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching company news:', error)
    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      articles: [],
      error: 'Failed to fetch company news',
      lastUpdate: new Date().toISOString()
    }, { status: 500 })
  }
}
