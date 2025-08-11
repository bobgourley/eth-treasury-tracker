#!/usr/bin/env node

/**
 * Test script to check SEC EDGAR API directly
 */

async function testSecApi() {
  try {
    console.log('🔍 Testing SEC EDGAR API...')
    
    const query = {
      q: 'ethereum',
      dateRange: 'all',
      category: 'custom',
      startdt: '2023-01-01',
      enddt: '2024-12-31',
      forms: [],
      from: 0,
      size: 10
    }

    console.log('📋 Query parameters:', JSON.stringify(query, null, 2))
    
    const response = await fetch('https://efts.sec.gov/LATEST/search/index', {
      method: 'POST',
      headers: {
        'User-Agent': 'EthereumList.com admin@ethereumlist.com',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    })
    
    console.log('📡 Response status:', response.status, response.statusText)
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error response body:', errorText)
      throw new Error(`SEC API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('✅ Success! Found', data.hits?.total?.value || 0, 'results')
    console.log('📊 Sample data:', JSON.stringify(data, null, 2).substring(0, 1000) + '...')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSecApi()
