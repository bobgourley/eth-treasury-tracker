#!/usr/bin/env node

/**
 * Clear all SEC filings from the database to prepare for real data
 */

async function clearSecFilings() {
  try {
    console.log('🗑️ Clearing existing SEC filings data...')
    
    const response = await fetch('https://ethereumlist.com/api/sec-filings', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      // If DELETE endpoint doesn't exist, we'll need to clear manually via SQL
      console.log('⚠️ DELETE endpoint not available, data will be replaced during population')
      return
    }

    const result = await response.json()
    console.log('✅ SEC filings cleared:', result)
    
  } catch (error) {
    console.error('❌ Error clearing SEC filings:', error)
  }
}

clearSecFilings()
