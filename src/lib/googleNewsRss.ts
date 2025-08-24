// Google News RSS integration for Ethereum news
import { XMLParser } from 'fast-xml-parser'

export interface GoogleNewsItem {
  title: string
  description: string
  url: string
  publishedAt: string
  source: string
  guid: string
}

/**
 * Fetch and parse Google News RSS feed for Ethereum-related news
 */
export async function fetchEthereumNews(limit: number = 10): Promise<GoogleNewsItem[]> {
  try {
    // Google News RSS URL for Ethereum news
    const rssUrl = `https://news.google.com/rss/search?q=ethereum&hl=en&gl=US&ceid=US:en`
    
    console.log('Fetching Ethereum news from Google News RSS...')
    
    const response = await fetch(rssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EthereumTracker/1.0; +https://ethereumlist.com)'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS feed: ${response.status}`)
    }
    
    const xmlData = await response.text()
    
    // Parse XML with fast-xml-parser
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    })
    
    const result = parser.parse(xmlData)
    
    if (!result.rss?.channel?.item) {
      throw new Error('Invalid RSS format: no items found')
    }
    
    const items = Array.isArray(result.rss.channel.item) ? result.rss.channel.item : [result.rss.channel.item].filter(Boolean)
  
    const newsItems = items.slice(0, limit).map((item: unknown) => {
      const newsItem = item as Record<string, string>
      const titleStr = String(newsItem.title || '')
      const titleParts = titleStr.split(' - ')
      const cleanTitle = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : titleStr
      const source = titleParts.length > 1 ? titleParts[titleParts.length - 1] : 'Unknown'
      
      return {
        title: cleanTitle || 'No title',
        description: String(newsItem.description || ''),
        url: String(newsItem.link || ''),
        publishedAt: String(newsItem.pubDate || new Date().toISOString()),
        source: source,
        guid: String(newsItem.guid || newsItem.link || Math.random().toString())
      }
    })
    
    console.log(`✅ Fetched ${newsItems.length} Ethereum news articles from Google News`)
    return newsItems
    
  } catch (error) {
    console.error('❌ Failed to fetch Google News RSS:', error)
    return []
  }
}

/**
 * Fetch news for multiple Ethereum-related topics
 */
export async function fetchEthereumNewsMultiTopic(limit: number = 15): Promise<GoogleNewsItem[]> {
  const topics = [
    'ethereum',
    'ethereum price',
    'ethereum ETF',
    'ethereum staking'
  ]
  
  try {
    const allNews: GoogleNewsItem[] = []
    
    for (const topic of topics) {
      const encodedTopic = encodeURIComponent(topic)
      const rssUrl = `https://news.google.com/rss/search?q=${encodedTopic}&hl=en&gl=US&ceid=US:en`
      
      const response = await fetch(rssUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EthereumTracker/1.0; +https://ethereumlist.com)',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      })
      
      if (response.ok) {
        const xmlData = await response.text()
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: '@_'
        })
        
        const result = parser.parse(xmlData)
        
        if (result.rss?.channel?.item) {
          const items = Array.isArray(result.rss.channel.item) 
            ? result.rss.channel.item 
            : [result.rss.channel.item]
          
          // Take first 3-4 items from each topic
          const topicNews = items.slice(0, 4).map((item: unknown) => {
            const newsItem = item as Record<string, string>
            const titleStr = String(newsItem.title || '')
            const titleParts = titleStr.split(' - ')
            const cleanTitle = titleParts.length > 1 ? titleParts.slice(0, -1).join(' - ') : titleStr
            const source = titleParts.length > 1 ? titleParts[titleParts.length - 1] : 'Unknown'
            
            return {
              title: cleanTitle || 'No title',
              description: String(newsItem.description || ''),
              url: String(newsItem.link || ''),
              publishedAt: String(newsItem.pubDate || new Date().toISOString()),
              source: source,
              guid: String(newsItem.guid || newsItem.link || Math.random().toString())
            }
          })
          
          allNews.push(...topicNews)
        }
      }
      
      // Small delay between requests to be respectful
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    // Remove duplicates by URL and sort by date
    const uniqueNews = allNews.filter((item, index, self) => 
      index === self.findIndex(t => t.url === item.url)
    ).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    console.log(`✅ Fetched ${uniqueNews.length} unique Ethereum news articles from multiple topics`)
    return uniqueNews.slice(0, limit)
    
  } catch (error) {
    console.error('❌ Failed to fetch multi-topic Google News RSS:', error)
    return []
  }
}

/**
 * Format date for display
 */
export function formatNewsDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'Recently'
  }
}
