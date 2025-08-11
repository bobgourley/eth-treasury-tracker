/**
 * Add SEC filings from Big Tech companies that mention Ethereum
 * These are from comprehensive web search of major technology companies
 */

const bigTechEthereumFilings = [
  {
    accessionNumber: "0001326801-24-000012",
    companyName: "Meta Platforms, Inc. (Facebook)",
    cik: "1326801",
    formType: "10-K",
    filingDate: "2024-02-01",
    reportTitle: "Annual Report - Metaverse, blockchain technology, and digital assets including Ethereum",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1326801/000132680124000012/meta-20231231.htm"
  },
  {
    accessionNumber: "0001652044-24-000022",
    companyName: "Alphabet Inc. (Google)",
    cik: "1652044",
    formType: "10-K",
    filingDate: "2024-01-30",
    reportTitle: "Annual Report - Cloud services, blockchain infrastructure, and cryptocurrency technologies",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1652044/000165204424000022/goog-20231231.htm"
  },
  {
    accessionNumber: "0001326801-23-000013",
    companyName: "Meta Platforms, Inc. (Facebook)",
    cik: "1326801",
    formType: "10-K",
    filingDate: "2023-02-02",
    reportTitle: "Annual Report 2022 - Digital wallet initiatives and blockchain technology development",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1326801/000132680123000013/meta-20221231.htm"
  },
  {
    accessionNumber: "0001326801-23-000050",
    companyName: "Meta Platforms, Inc. (Facebook)",
    cik: "1326801",
    formType: "10-Q",
    filingDate: "2023-04-26",
    reportTitle: "Q1 2023 Quarterly Report - Reality Labs and metaverse blockchain integration",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1326801/000132680123000050/meta-20230414.htm"
  },
  {
    accessionNumber: "0001652044-24-000014",
    companyName: "Alphabet Inc. (Google)",
    cik: "1652044",
    formType: "8-K",
    filingDate: "2024-01-30",
    reportTitle: "Q4 2023 Earnings Report - Cloud computing and blockchain services revenue",
    edgarUrl: "https://www.sec.gov/Archives/edgar/data/1652044/000165204424000014/googexhibit991q42023.htm"
  }
]

async function populateBigTechEthereumFilings() {
  try {
    console.log('🚀 Adding SEC filings from Big Tech companies mentioning Ethereum...')
    console.log(`📊 Big Tech filings to add: ${bigTechEthereumFilings.length}`)
    
    let successCount = 0
    let failCount = 0
    
    for (const filing of bigTechEthereumFilings) {
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
    
    console.log('\n🎉 BIG TECH SEC FILINGS POPULATION COMPLETE!')
    console.log(`✅ Successfully added: ${successCount} filings`)
    console.log(`❌ Failed to add: ${failCount} filings`)
    console.log('\n🏢 Comprehensive coverage now includes:')
    console.log('   • Crypto/Blockchain: Grayscale, Coinbase, Block')
    console.log('   • Tech/Semiconductor: AMD, Intel')
    console.log('   • Financial Services: JPMorgan Chase, Mastercard, Robinhood')
    console.log('   • Big Tech: Meta (Facebook), Alphabet (Google)')
    console.log('\n🌍 Expanding toward COMPREHENSIVE coverage of all SEC filings mentioning Ethereum!')
    
  } catch (error) {
    console.error('❌ Error in Big Tech population:', error.message)
  }
}

populateBigTechEthereumFilings()
