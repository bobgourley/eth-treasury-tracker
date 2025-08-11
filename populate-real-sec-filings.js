#!/usr/bin/env node

/**
 * Populate SEC filings database with real Ethereum-related filings from SEC EDGAR
 */

async function populateRealSecFilings() {
  try {
    console.log('🔄 Fetching real SEC filings mentioning Ethereum...')
    
    const response = await fetch('https://ethereumlist.com/api/sec-filings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'refresh'
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Real SEC filings population result:', result)
    
    if (result.success) {
      console.log(`📊 Summary:`)
      console.log(`   New filings: ${result.data.newFilings}`)
      console.log(`   Updated filings: ${result.data.updatedFilings}`)
      console.log(`   Skipped filings: ${result.data.skippedFilings}`)
      console.log(`   Total processed: ${result.data.totalProcessed}`)
    }
    
  } catch (error) {
    console.error('❌ Error populating real SEC filings:', error)
  }
}

populateRealSecFilings()
