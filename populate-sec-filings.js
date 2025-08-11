#!/usr/bin/env node

/**
 * Script to populate SEC filings data by calling the admin POST endpoint
 */

async function populateSecFilings() {
  try {
    console.log('🔄 Triggering SEC filings data population...')
    
    const response = await fetch('https://ethereumlist.com/api/sec-filings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        daysBack: 365 // Fetch filings from the last year
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('✅ SEC filings population result:', JSON.stringify(result, null, 2))
    
  } catch (error) {
    console.error('❌ Error populating SEC filings:', error)
  }
}

populateSecFilings()
