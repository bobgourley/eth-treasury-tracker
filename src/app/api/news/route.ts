import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

export async function GET(request: NextRequest) {
  try {
    const newsApiKey = process.env.NEWS_API_KEY
    
    if (!newsApiKey) {
      return NextResponse.json({
        error: 'News API key not configured',
        articles: []
      }, { status: 500 })
    }

    console.log('🔍 Fetching Ethereum Treasury Company news...')
    
    // Get all tracked companies for context
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: { name: true, ticker: true }
    })
    
    const allArticles: NewsArticle[] = []
    
    // Search strategies for Ethereum Treasury Company news
    const searchQueries = [
      // General ETH treasury terms
      'ethereum treasury company',
      'ethereum treasury companies',
      'corporate ethereum holdings',
      'companies holding ethereum',
      'institutional ethereum adoption',
      
      // Specific company searches (top companies)
      'BTCS ethereum holdings',
      'BitMine Immersion ethereum',
      'SharpLink Gaming ethereum',
      'Bit Digital ethereum treasury',
      'GameSquare Holdings ethereum',
      
      // Broader crypto treasury terms
      'crypto treasury management',
      'corporate cryptocurrency holdings',
      'public companies ethereum',
      'ethereum corporate adoption',
      'crypto balance sheet strategy'
    ]
    
    console.log(`📰 Searching with ${searchQueries.length} different queries...`)
    
    // Execute searches with rate limiting
    for (let i = 0; i < Math.min(searchQueries.length, 5); i++) {
      const query = searchQueries[i]
      
      try {
        console.log(`🔎 Searching: "${query}"`)
        
        const response = await fetch(
          `https://newsapi.org/v2/everything?` +
          `q=${encodeURIComponent(query)}&` +
          `language=en&` +
          `sortBy=publishedAt&` +
          `pageSize=20&` +
          `from=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}&` +
          `apiKey=${newsApiKey}`,
          {
            headers: {
              'User-Agent': 'EthereumTreasuryTracker/1.0'
            }
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.articles && Array.isArray(data.articles)) {
            console.log(`📄 Found ${data.articles.length} articles for "${query}"`)
            
            // Process and filter articles
            const processedArticles = data.articles
              .filter((article: any) => 
                article.title && 
                article.description && 
                article.url &&
                article.title !== '[Removed]' &&
                article.description !== '[Removed]'
              )
              .map((article: any) => {
                // Try to match article to a specific company
                let matchedCompany = null
                let matchedTicker = null
                
                const articleText = `${article.title} ${article.description}`.toLowerCase()
                
                for (const company of companies) {
                  const companyName = company.name.toLowerCase()
                  const ticker = company.ticker?.toLowerCase()
                  
                  if (articleText.includes(companyName) || 
                      (ticker && articleText.includes(ticker))) {
                    matchedCompany = company.name
                    matchedTicker = company.ticker
                    break
                  }
                }
                
                return {
                  ...article,
                  company: matchedCompany,
                  ticker: matchedTicker
                }
              })
            
            allArticles.push(...processedArticles)
          }
        } else {
          console.log(`⚠️ Search failed for "${query}": ${response.status}`)
        }
        
        // Rate limiting: wait between requests
        if (i < searchQueries.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
        
      } catch (error) {
        console.log(`❌ Error searching "${query}":`, error)
      }
    }
    
    // Remove duplicates based on URL
    const uniqueArticles = allArticles.filter((article, index, self) =>
      index === self.findIndex(a => a.url === article.url)
    )
    
    // Sort by publication date (newest first)
    uniqueArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    
    // Limit to top 50 articles
    const finalArticles = uniqueArticles.slice(0, 50)
    
    console.log(`✅ Returning ${finalArticles.length} unique articles`)
    
    // Group articles by company vs general
    const companyArticles = finalArticles.filter(article => article.company)
    const generalArticles = finalArticles.filter(article => !article.company)
    
    return NextResponse.json({
      articles: finalArticles,
      stats: {
        total: finalArticles.length,
        companySpecific: companyArticles.length,
        general: generalArticles.length,
        searchQueries: searchQueries.length,
        companiesTracked: companies.length
      },
      lastUpdated: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error fetching news:', error)
    return NextResponse.json({
      error: 'Failed to fetch news',
      details: error instanceof Error ? error.message : 'Unknown error',
      articles: []
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
