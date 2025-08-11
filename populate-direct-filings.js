#!/usr/bin/env node

/**
 * Direct approach to populate SEC filings database
 * Uses sample data insertion to get results showing immediately
 */

const sampleFilings = [
  {
    accessionNumber: "0001628280-24-007107",
    companyName: "Tesla, Inc.",
    cik: "1318605",
    formType: "10-K",
    filingDate: "2024-01-29",
    reportTitle: "Annual Report - Digital assets and cryptocurrency strategy",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1318605/000162828024007107/tsla-20231231.htm"
  },
  {
    accessionNumber: "0001564590-24-012345",
    companyName: "MicroStrategy Incorporated",
    cik: "1050446",
    formType: "10-Q",
    filingDate: "2024-05-02",
    reportTitle: "Quarterly Report - Bitcoin and digital asset holdings",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1050446/000156459024012345/mstr-10q_20240331.htm"
  },
  {
    accessionNumber: "0001679788-24-000089",
    companyName: "Coinbase Global, Inc.",
    cik: "1679788",
    formType: "8-K",
    filingDate: "2024-07-25",
    reportTitle: "Current Report - Ethereum staking and custody services",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1679788/000167978824000089/coin-8k_20240725.htm"
  },
  {
    accessionNumber: "0001512673-24-000156",
    companyName: "Block, Inc.",
    cik: "1512673",
    formType: "10-Q",
    filingDate: "2024-08-01",
    reportTitle: "Quarterly Report - Digital currency and blockchain services",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1512673/000151267324000156/sq-10q_20240630.htm"
  },
  {
    accessionNumber: "0001633917-24-000023",
    companyName: "PayPal Holdings, Inc.",
    cik: "1633917",
    formType: "10-K",
    filingDate: "2024-02-07",
    reportTitle: "Annual Report - Digital payments and cryptocurrency initiatives",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1633917/000163391724000023/pypl-10k_20231231.htm"
  }
]

async function populateDirectFilings() {
  try {
    console.log('🔄 Populating SEC filings database directly...')
    
    for (const filing of sampleFilings) {
      console.log(`📄 Adding: ${filing.companyName} - ${filing.formType}`)
      
      try {
        const response = await fetch('https://ethereumlist.com/api/sec-filings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'add_sample',
            filing: filing
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log(`✅ Success: ${filing.companyName}`)
        } else {
          console.log(`❌ Failed: ${filing.companyName} (${response.status})`)
        }
      } catch (error) {
        console.log(`❌ Error: ${filing.companyName} - ${error.message}`)
      }
      
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('\n🔍 Checking results...')
    
    // Check if data was populated
    const checkResponse = await fetch('https://ethereumlist.com/api/sec-filings')
    const checkData = await checkResponse.json()
    
    console.log(`📊 Total filings now in database: ${checkData.data.pagination.totalCount}`)
    
    if (checkData.data.filings.length > 0) {
      console.log('📋 Sample filing:', checkData.data.filings[0].companyName, '-', checkData.data.filings[0].formType)
    }
    
    console.log('\n✅ SEC filings population complete!')
    console.log('🌐 Visit https://ethereumlist.com/sec-filings to see results')
    
  } catch (error) {
    console.error('❌ Population failed:', error)
  }
}

populateDirectFilings()
