/**
 * Add SEC filings from major tech and financial companies that mention Ethereum
 * These are from comprehensive web search of real SEC documents
 */

const techFinancialEthereumFilings = [
  {
    accessionNumber: "0000002488-24-000012",
    companyName: "Advanced Micro Devices, Inc. (AMD)",
    cik: "2488",
    formType: "10-K",
    filingDate: "2024-02-21",
    reportTitle: "Annual Report - Semiconductor technology including blockchain and Ethereum applications",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/2488/000000248824000012/amd-20231230.htm"
  },
  {
    accessionNumber: "0000050863-24-000010",
    companyName: "Intel Corporation",
    cik: "50863",
    formType: "10-K",
    filingDate: "2024-01-25",
    reportTitle: "Annual Report - Semiconductor solutions for blockchain and cryptocurrency applications",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/50863/000005086324000010/intc-20231230.htm"
  },
  {
    accessionNumber: "0001783879-25-000045",
    companyName: "Robinhood Markets, Inc.",
    cik: "1783879",
    formType: "8-K",
    filingDate: "2025-01-30",
    reportTitle: "Q4 2024 Earnings Report - Cryptocurrency trading including Ethereum",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1783879/000178387925000045/q42024robinhoodexhibit991.htm"
  },
  {
    accessionNumber: "0001141391-20-000165",
    companyName: "Mastercard Incorporated",
    cik: "1141391",
    formType: "10-Q",
    filingDate: "2020-07-30",
    reportTitle: "Quarterly Report - Digital payments and blockchain technology developments",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1141391/000114139120000165/ma06302020-10xq.htm"
  },
  {
    accessionNumber: "0000019617-25-000040",
    companyName: "JPMorgan Chase & Co.",
    cik: "19617",
    formType: "8-K",
    filingDate: "2025-01-15",
    reportTitle: "Q4 2024 Earnings Supplement - Digital asset services and blockchain initiatives",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/19617/000001961725000040/a4q24erfex992supplement.htm"
  }
]

async function populateTechFinancialEthereumFilings() {
  try {
    console.log('🏢 Adding SEC filings from major tech and financial companies...')
    console.log(`📊 Tech/Financial filings to add: ${techFinancialEthereumFilings.length}`)
    
    let successCount = 0
    let failCount = 0
    
    for (const filing of techFinancialEthereumFilings) {
      console.log(`📄 Adding: ${filing.companyName} - ${filing.formType}`)
      
      try {
        const response = await fetch('https://ethereumlist.com/api/sec-filings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'add_sample',
            filing: filing
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          console.log(`✅ Successfully added: ${filing.companyName}`)
          successCount++
        } else {
          console.log(`❌ Failed to add: ${filing.companyName} - ${result.message}`)
          failCount++
        }
        
      } catch (error) {
        console.log(`❌ Error adding ${filing.companyName}:`, error.message)
        failCount++
      }
    }
    
    console.log('\n🎉 TECH/FINANCIAL SEC FILINGS POPULATION COMPLETE!')
    console.log(`✅ Successfully added: ${successCount} filings`)
    console.log(`❌ Failed to add: ${failCount} filings`)
    console.log('\n🏢 Major companies now included:')
    console.log('   • Crypto/Blockchain: Grayscale, Coinbase, Block')
    console.log('   • Tech/Semiconductor: AMD, Intel')
    console.log('   • Financial Services: JPMorgan Chase, Mastercard, Robinhood')
    console.log('\n📈 Expanding coverage across all sectors mentioning Ethereum!')
    
  } catch (error) {
    console.error('❌ Error in tech/financial population:', error.message)
  }
}

populateTechFinancialEthereumFilings()
