// API route for Google News RSS integration
import { NextRequest, NextResponse } from 'next/server'
import { fetchEthereumNewsMultiTopic, GoogleNewsItem } from '@/lib/googleNewsRss'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const refresh = searchParams.get('refresh') === 'true'
    
    // Check if we have recent cached news (unless refresh is requested)
    if (!refresh) {
      const recentNews = await prisma.newsArticle.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
          },
          isActive: true
        },
        orderBy: { publishedAt: 'desc' },
        take: limit
      })
      
      if (recentNews.length > 0) {
        console.log(`📰 Returning ${recentNews.length} cached news articles`)
        return NextResponse.json({
          success: true,
          count: recentNews.length,
          articles: recentNews.map(article => ({
            title: article.title,
            description: article.description || '',
            url: article.url,
            publishedAt: article.publishedAt.toISOString(),
            source: { name: article.sourceName },
            company: article.company,
            ticker: article.ticker
          })),
          cached: true
        })
      }
    }
    
    // Fetch fresh news from Google News RSS
    console.log('🔄 Fetching fresh Ethereum news from Google News RSS...')
    const newsItems: GoogleNewsItem[] = await fetchEthereumNewsMultiTopic(limit)
    
    if (newsItems.length === 0) {
      console.log('⚠️ No news from RSS, checking database for recent articles...')
      // If RSS fails, try to get recent articles from database
      const dbNews = await prisma.newsArticle.findMany({
        where: { 
          isActive: true,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        },
        orderBy: { publishedAt: 'desc' },
        take: limit
      })
      
      if (dbNews.length > 0) {
        console.log(`📰 Returning ${dbNews.length} cached articles from database`)
        return NextResponse.json({
          success: true,
          count: dbNews.length,
          articles: dbNews.map(article => ({
            title: article.title,
            description: article.description || '',
            url: article.url,
            publishedAt: article.publishedAt.toISOString(),
            source: { name: article.sourceName },
            company: article.company,
            ticker: article.ticker
          })),
          cached: true,
          message: 'RSS failed, using database cache'
        })
      }
      
      return NextResponse.json({
        success: false,
        error: 'No news articles found from RSS or database',
        count: 0,
        articles: []
      })
    }
    
    // Store new articles in database (upsert to avoid duplicates)
    const savedArticles = []
    
    for (const item of newsItems) {
      try {
        const saved = await prisma.newsArticle.upsert({
          where: { url: item.url },
          update: {
            title: item.title,
            description: item.description,
            sourceName: item.source,
            publishedAt: new Date(item.publishedAt),
            isActive: true
          },
          create: {
            title: item.title,
            description: item.description,
            url: item.url,
            publishedAt: new Date(item.publishedAt),
            sourceName: item.source,
            company: null,
            ticker: null,
            isActive: true
          }
        })
        
        savedArticles.push(saved)
      } catch (error) {
        console.error(`Failed to save article: ${item.title}`, error)
      }
    }
    
    console.log(`✅ Saved ${savedArticles.length} news articles to database`)
    
    // Return formatted response
    return NextResponse.json({
      success: true,
      count: savedArticles.length,
      articles: savedArticles.map(article => ({
        title: article.title,
        description: article.description || '',
        url: article.url,
        publishedAt: article.publishedAt.toISOString(),
        source: { name: article.sourceName },
        company: article.company,
        ticker: article.ticker
      })),
      cached: false,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Google News RSS API error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error',
      count: 0,
      articles: []
    }, { status: 500 })
  }
}

// Optional: Add a POST method to manually refresh news
export async function POST(_request: NextRequest) {
  try {
    console.log('🔄 Manual refresh of Ethereum news requested...')
    
    // Fetch fresh news
    const newsItems: GoogleNewsItem[] = await fetchEthereumNewsMultiTopic(15)
    
    if (newsItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No news articles found'
      })
    }
    
    // Deactivate old news articles (older than 7 days)
    await prisma.newsArticle.updateMany({
      where: {
        publishedAt: {
          lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      data: { isActive: false }
    })
    
    // Save new articles
    let savedCount = 0
    for (const item of newsItems) {
      try {
        await prisma.newsArticle.upsert({
          where: { url: item.url },
          update: {
            title: item.title,
            description: item.description,
            sourceName: item.source,
            publishedAt: new Date(item.publishedAt),
            isActive: true
          },
          create: {
            title: item.title,
            description: item.description,
            url: item.url,
            publishedAt: new Date(item.publishedAt),
            sourceName: item.source,
            company: null,
            ticker: null,
            isActive: true
          }
        })
        savedCount++
      } catch (error) {
        console.error(`Failed to save article: ${item.title}`, error)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Refreshed ${savedCount} news articles`,
      count: savedCount
    })
    
  } catch (error) {
    console.error('❌ Manual news refresh error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to refresh news',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
