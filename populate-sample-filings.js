#!/usr/bin/env node

/**
 * Script to populate SEC filings with sample data
 * This provides initial data while we work on the automated SEC API integration
 */

const sampleFilings = [
  {
    accessionNumber: "0001628280-23-003781",
    companyName: "MicroStrategy Incorporated",
    cik: "1050446",
    formType: "10-K",
    filingDate: "2023-02-01",
    reportTitle: "Annual Report - Digital asset strategy and Bitcoin holdings",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1050446/000162828023003781/mstr-20221231.htm"
  },
  {
    accessionNumber: "0001193125-24-017726",
    companyName: "Tesla, Inc.",
    cik: "1318605",
    formType: "10-K",
    filingDate: "2024-01-29",
    reportTitle: "Annual Report - Digital assets and cryptocurrency",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1318605/000095017024017726/tsla-20231231.htm"
  },
  {
    accessionNumber: "0001679788-24-000043",
    companyName: "Coinbase Global, Inc.",
    cik: "1679788",
    formType: "10-Q",
    filingDate: "2024-05-02",
    reportTitle: "Quarterly Report - Cryptocurrency platform operations",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1679788/000167978824000043/coin-20240331.htm"
  },
  {
    accessionNumber: "0001564590-24-017089",
    companyName: "Block, Inc.",
    cik: "1512673",
    formType: "10-K",
    filingDate: "2024-02-22",
    reportTitle: "Annual Report - Financial services and digital payments",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1512673/000156459024017089/sq-20231231.htm"
  },
  {
    accessionNumber: "0001633917-24-000006",
    companyName: "PayPal Holdings, Inc.",
    cik: "1633917",
    formType: "10-K",
    filingDate: "2024-02-07",
    reportTitle: "Annual Report - Digital payments platform",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1633917/000163391724000006/pypl-20231231.htm"
  }
]

async function populateSampleFilings() {
  try {
    console.log('🔄 Populating SEC filings with sample data...')
    
    for (const filing of sampleFilings) {
      console.log(`📄 Adding filing: ${filing.companyName} - ${filing.formType}`)
      
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
      
      if (!response.ok) {
        console.error(`❌ Failed to add filing for ${filing.companyName}: ${response.status}`)
        continue
      }
      
      const result = await response.json()
      console.log(`✅ Added: ${filing.companyName}`)
    }
    
    console.log('✅ Sample SEC filings population complete!')
    
  } catch (error) {
    console.error('❌ Error populating sample filings:', error)
  }
}

populateSampleFilings()
