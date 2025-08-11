/**
 * Targeted SEC filings population script
 * Uses a more conservative approach to avoid timeouts
 */

const https = require('https')

async function populateTargetedSecFilings() {
  try {
    console.log('🎯 Starting targeted SEC filings population...')
    
    // Use a more conservative approach - recent data first
    const response = await fetch('https://ethereumlist.com/api/sec-filings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'recent_refresh', // Use recent instead of comprehensive
        maxResults: 100
      })
    })
    
    const result = await response.json()
    
    if (result.success) {
      console.log('✅ Targeted SEC filings population completed:')
      console.log(`   New filings: ${result.data.newFilings}`)
      console.log(`   Updated filings: ${result.data.updatedFilings}`)
      console.log(`   Total processed: ${result.data.totalProcessed}`)
    } else {
      console.error('❌ Failed to populate SEC filings:', result.error)
    }
    
  } catch (error) {
    console.error('❌ Error in targeted population:', error.message)
  }
}

populateTargetedSecFilings()
