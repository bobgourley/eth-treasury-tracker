import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Fetch raw RSS data to see exact URLs
    const topics = [
      'ethereum',
      'ethereum+price',
      'ethereum+news'
    ]
    
    const debugData = []
    
    for (const topic of topics) {
      const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
          }
        })
        
        if (!response.ok) {
          debugData.push({
            topic,
            error: `HTTP ${response.status}: ${response.statusText}`
          })
          continue
        }
        
        const xmlText = await response.text()
        
        // Parse XML manually to see raw data
        const items = []
        const itemMatches = xmlText.match(/<item>(.*?)<\/item>/gs)
        
        if (itemMatches) {
          for (let i = 0; i < Math.min(3, itemMatches.length); i++) {
            const item = itemMatches[i]
            
            // Extract raw link
            const linkMatch = item.match(/<link>(.*?)<\/link>/)
            const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)
            
            const rawLink = linkMatch ? linkMatch[1] : 'No link found'
            const title = titleMatch ? titleMatch[1] : 'No title found'
            
            // Try to process the link
            let processedLink = rawLink
            if (rawLink.includes('news.google.com')) {
              try {
                const urlParams = new URLSearchParams(rawLink.split('?')[1])
                const actualUrl = urlParams.get('url')
                if (actualUrl) {
                  processedLink = decodeURIComponent(actualUrl)
                }
              } catch (e) {
                processedLink = `Error processing: ${rawLink}`
              }
            }
            
            items.push({
              title: title.substring(0, 100) + '...',
              rawLink,
              processedLink,
              isGoogleRedirect: rawLink.includes('news.google.com')
            })
          }
        }
        
        debugData.push({
          topic,
          itemCount: itemMatches?.length || 0,
          items
        })
        
      } catch (error) {
        debugData.push({
          topic,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      debugData
    })
    
  } catch (error) {
    console.error('Debug RSS error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
