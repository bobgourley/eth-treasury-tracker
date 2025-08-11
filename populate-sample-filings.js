#!/usr/bin/env node

/**
 * Script to populate SEC filings with sample data
 * This provides initial data while we work on the automated SEC API integration
 */

const sampleFilings = [
  {
    accessionNumber: "0001193125-24-123456",
    companyName: "Tesla, Inc.",
    cik: "1318605",
    formType: "10-K",
    filingDate: "2024-02-26",
    reportTitle: "Annual Report - Mentions cryptocurrency and Ethereum investments",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1318605/000119312524123456/d123456d10k.htm"
  },
  {
    accessionNumber: "0001193125-24-234567",
    companyName: "MicroStrategy Incorporated",
    cik: "1050446",
    formType: "10-Q",
    filingDate: "2024-05-01",
    reportTitle: "Quarterly Report - Digital asset strategy including Ethereum considerations",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1050446/000119312524234567/d234567d10q.htm"
  },
  {
    accessionNumber: "0001193125-24-345678",
    companyName: "Coinbase Global, Inc.",
    cik: "1679788",
    formType: "8-K",
    filingDate: "2024-07-15",
    reportTitle: "Current Report - Ethereum staking services and regulatory updates",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1679788/000119312524345678/d345678d8k.htm"
  },
  {
    accessionNumber: "0001193125-24-456789",
    companyName: "Block, Inc.",
    cik: "1512673",
    formType: "10-Q",
    filingDate: "2024-08-05",
    reportTitle: "Quarterly Report - Cryptocurrency services including Ethereum",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1512673/000119312524456789/d456789d10q.htm"
  },
  {
    accessionNumber: "0001193125-24-567890",
    companyName: "PayPal Holdings, Inc.",
    cik: "1633917",
    formType: "10-K",
    filingDate: "2024-01-30",
    reportTitle: "Annual Report - Digital currency initiatives including Ethereum support",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1633917/000119312524567890/d567890d10k.htm"
  },
  {
    accessionNumber: "0001193125-24-678901",
    companyName: "Marathon Digital Holdings, Inc.",
    cik: "1507605",
    formType: "8-K",
    filingDate: "2024-06-20",
    reportTitle: "Current Report - Expansion into Ethereum mining operations",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1507605/000119312524678901/d678901d8k.htm"
  },
  {
    accessionNumber: "0001193125-24-789012",
    companyName: "Riot Platforms, Inc.",
    cik: "1167419",
    formType: "10-Q",
    filingDate: "2024-03-12",
    reportTitle: "Quarterly Report - Cryptocurrency mining including Ethereum considerations",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1167419/000119312524789012/d789012d10q.htm"
  },
  {
    accessionNumber: "0001193125-24-890123",
    companyName: "Robinhood Markets, Inc.",
    cik: "1783879",
    formType: "10-K",
    filingDate: "2024-02-15",
    reportTitle: "Annual Report - Cryptocurrency trading platform including Ethereum",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1783879/000119312524890123/d890123d10k.htm"
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
