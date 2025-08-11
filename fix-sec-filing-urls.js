#!/usr/bin/env node

/**
 * Fix SEC filing URLs to point to human-readable HTML versions
 * instead of raw text files
 */

async function fixSecFilingUrls() {
  try {
    console.log('🔧 Fixing SEC filing URLs to be human-readable...')
    
    // Clear existing data and repopulate with fixed URLs
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
    console.log('✅ SEC filing URLs fixed:', result)
    
    if (result.success) {
      console.log(`📊 Summary:`)
      console.log(`   New filings: ${result.data.newFilings}`)
      console.log(`   Updated filings: ${result.data.updatedFilings}`)
      console.log(`   Skipped filings: ${result.data.skippedFilings}`)
      console.log(`   Total processed: ${result.data.totalProcessed}`)
      console.log('')
      console.log('🎉 All SEC filing URLs now point to human-readable HTML versions!')
    }
    
  } catch (error) {
    console.error('❌ Error fixing SEC filing URLs:', error)
  }
}

fixSecFilingUrls()
