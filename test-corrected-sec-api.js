#!/usr/bin/env node

/**
 * Test script to trigger the corrected SEC EDGAR API implementation
 */

async function testCorrectedSecApi() {
  try {
    console.log('🔄 Testing corrected SEC EDGAR API implementation...')
    
    const response = await fetch('https://ethereumlist.com/api/sec-filings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // No action specified - should trigger automated SEC EDGAR fetching
      })
    })
    
    console.log('📡 Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error response body:', errorText)
      throw new Error(`API error: ${response.status}`)
    }
    
    const result = await response.json()
    console.log('✅ Success! SEC EDGAR API result:')
    console.log(JSON.stringify(result, null, 2))
    
    // Now check if data was populated
    console.log('\n🔍 Checking if SEC filings data was populated...')
    
    const getResponse = await fetch('https://ethereumlist.com/api/sec-filings')
    const getData = await getResponse.json()
    
    console.log(`📊 Total filings in database: ${getData.data.pagination.totalCount}`)
    if (getData.data.filings.length > 0) {
      console.log('📋 Sample filing:', getData.data.filings[0])
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testCorrectedSecApi()
