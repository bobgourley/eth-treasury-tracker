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
    
    // Try multiple search strategies to maximize results
    let newsData: NewsAPIResponse | null = null
    let searchAttempts = 0
    
    // Strategy 1: Company name + crypto keywords
    const searchQueries = [
      `"${companyName}" AND (crypto OR cryptocurrency OR bitcoin OR ethereum)`,
      `"${ticker.toUpperCase()}" AND (crypto OR cryptocurrency OR bitcoin OR ethereum)`,
      `"${companyName}" AND (stock OR shares OR trading)`,
      `"${ticker.toUpperCase()}" AND (stock OR shares OR trading)`,
      `${companyName.replace(/Inc|Corp|Ltd|plc/gi, '').trim()} crypto`,
      `${ticker.toUpperCase()} stock`
    ]
    
    for (const searchQuery of searchQueries) {
      searchAttempts++
      console.log(`🔍 News search attempt ${searchAttempts}: "${searchQuery}"`)
    
      const newsResponse = await fetch(
        `https://newsapi.org/v2/everything?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `sortBy=publishedAt&` +
        `pageSize=20&` +
        `language=en&` +
        `from=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&` + // Last 30 days
        `apiKey=${newsApiKey}`,
        {
          next: { revalidate: 3600 } // Cache for 1 hour
        }
      )

      if (!newsResponse.ok) {
        console.log(`❌ NewsAPI request failed for query: ${searchQuery} (${newsResponse.status})`)
        continue // Try next search query
      }

      const currentNewsData: NewsAPIResponse = await newsResponse.json()
      
      if (currentNewsData.articles && currentNewsData.articles.length > 0) {
        console.log(`✅ Found ${currentNewsData.articles.length} articles with query: "${searchQuery}"`)
        newsData = currentNewsData
        break // Found articles, stop searching
      } else {
        console.log(`📰 No articles found with query: "${searchQuery}"`)
      }
    }
    
    // If no articles found with any query
    if (!newsData || !newsData.articles || newsData.articles.length === 0) {
      console.log(`❌ No news articles found for ${companyName} (${ticker}) after ${searchAttempts} attempts`)
      return NextResponse.json({
        ticker: ticker.toUpperCase(),
        companyName,
        articles: [],
        totalResults: 0,
        searchAttempts,
        lastUpdate: new Date().toISOString()
      })
    }
    
    // Filter articles to ensure they're relevant to the company (less strict filtering)
    const relevantArticles = newsData.articles.filter(article => {
      const titleLower = article.title.toLowerCase()
      const descriptionLower = (article.description || '').toLowerCase()
      const contentLower = (article.content || '').toLowerCase()
      const companyLower = companyName.toLowerCase()
      const tickerLower = ticker.toLowerCase()
      const companyShort = companyName.replace(/Inc|Corp|Ltd|plc/gi, '').trim().toLowerCase()
      
      // Check if any part of the article mentions the company
      const searchTerms = [companyLower, tickerLower, companyShort].filter(term => term.length > 2)
      
      return searchTerms.some(term => 
        titleLower.includes(term) || 
        descriptionLower.includes(term) ||
        contentLower.includes(term)
      )
    })
    
    // If strict filtering returns no results, use all articles from the search
    const finalArticles = relevantArticles.length > 0 ? relevantArticles : newsData.articles
    
    console.log(`📊 Filtered ${newsData.articles.length} articles down to ${finalArticles.length} relevant articles`)

    // Sort by published date (most recent first)
    finalArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      companyName,
      articles: finalArticles.slice(0, 5), // Return top 5 most relevant articles
      totalResults: finalArticles.length,
      searchAttempts,
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
