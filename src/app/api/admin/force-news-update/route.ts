import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user?.email || session.user.email !== 'bob@bobgourley.com') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 Force News Update: Starting...')

    // Force fetch fresh news from RSS
    const { fetchEthereumNewsMultiTopic } = await import('@/lib/googleNewsRss')
    const freshNews = await fetchEthereumNewsMultiTopic(10)
    
    console.log(`📡 Force News Update: Fetched ${freshNews.length} articles from RSS`)

    if (freshNews.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No news articles fetched from RSS',
        count: 0 
      })
    }

    // Save all articles to database
    let savedCount = 0
    const results = []

    for (const item of freshNews) {
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
        
        savedCount++
        results.push({
          title: item.title,
          source: item.source,
          publishedAt: item.publishedAt,
          status: 'saved'
        })
      } catch (dbError) {
        console.error('Failed to save news article:', dbError)
        results.push({
          title: item.title,
          source: item.source,
          status: 'error',
          error: dbError instanceof Error ? dbError.message : 'Unknown error'
        })
      }
    }

    // Verify articles are in database
    const dbCount = await prisma.newsArticle.count({
      where: { 
        isActive: true,
        publishedAt: {
          gte: new Date(Date.now() - 48 * 60 * 60 * 1000)
        }
      }
    })

    console.log(`✅ Force News Update: Saved ${savedCount}/${freshNews.length} articles, ${dbCount} total in DB`)

    return NextResponse.json({
      success: true,
      message: `Successfully updated news articles`,
      fetched: freshNews.length,
      saved: savedCount,
      totalInDb: dbCount,
      results
    })

  } catch (error) {
    console.error('❌ Force News Update Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
