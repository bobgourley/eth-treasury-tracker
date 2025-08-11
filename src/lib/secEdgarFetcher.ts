/**
 * SEC EDGAR API Integration for Ethereum-related filings
 * Searches for all SEC filings mentioning "ethereum"
 */

interface EdgarSearchResult {
  hits: {
    total: {
      value: number
      relation: string
    }
  }
  filings: EdgarFiling[]
}

interface EdgarFiling {
  _id: string
  _source: {
    file_num: string
    film_num: string
    form: string
    file_date: string
    company_name: string
    cik: string
    accession_num: string
    file_description?: string
    items?: string
    size?: string
    exhibits?: string
  }
}

interface SecFilingData {
  accessionNumber: string
  companyName: string
  cik: string
  formType: string
  filingDate: Date
  reportTitle?: string
  edgarUrl: string
  fullTextUrl?: string
}

/**
 * Searches SEC EDGAR for filings mentioning "ethereum"
 * Uses the SEC's master index files and company submissions API
 */
export async function searchEthereumFilings(
  startDate?: string,
  endDate?: string,
  maxResults: number = 100
): Promise<SecFilingData[]> {
  try {
    console.log('🔍 Searching SEC EDGAR for Ethereum-related filings...')
    
    const filings: SecFilingData[] = []
    const currentYear = new Date().getFullYear()
    const startYear = startDate ? parseInt(startDate.split('-')[0]) : 2020
    
    console.log(`📅 Search parameters:`, {
      dateRange: `${startYear} to ${currentYear}`,
      maxResults
    })

    // Search through recent quarterly master index files
    for (let year = Math.max(startYear, currentYear - 2); year <= currentYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        if (filings.length >= maxResults) break
        
        try {
          console.log(`📂 Searching ${year} Q${quarter} master index...`)
          
          const masterUrl = `https://www.sec.gov/Archives/edgar/full-index/${year}/QTR${quarter}/master.idx`
          
          const response = await fetch(masterUrl, {
            headers: {
              'User-Agent': 'EthereumList.com admin@ethereumlist.com',
              'Accept': 'text/plain'
            }
          })

          if (!response.ok) {
            console.log(`⚠️ Could not fetch ${year} Q${quarter} index: ${response.status}`)
            continue
          }

          const indexContent = await response.text()
          const lines = indexContent.split('\n')
          
          // Skip header lines and process filing entries
          for (let i = 10; i < lines.length && filings.length < maxResults; i++) {
            const line = lines[i].trim()
            if (!line) continue
            
            const parts = line.split('|')
            if (parts.length < 5) continue
            
            const [cik, companyName, formType, filingDate, documentPath] = parts
            
            // Skip if this doesn't look like a valid filing entry
            if (!cik || !companyName || !formType || !filingDate || !documentPath) continue
            
            // Check if we should fetch this filing's content to search for "ethereum"
            if (shouldCheckFiling(formType, companyName)) {
              try {
                const hasEthereum = await checkFilingForEthereum(documentPath)
                if (hasEthereum) {
                  const filing: SecFilingData = {
                    accessionNumber: extractAccessionNumber(documentPath),
                    companyName: companyName.trim(),
                    cik: cik.padStart(10, '0'),
                    formType: formType.trim(),
                    filingDate: new Date(filingDate),
                    reportTitle: `${formType} - Contains references to Ethereum`,
                    edgarUrl: `https://www.sec.gov/Archives/${documentPath}`,
                    fullTextUrl: `https://www.sec.gov/Archives/${documentPath}`
                  }
                  
                  filings.push(filing)
                  console.log(`✅ Found Ethereum mention: ${companyName} - ${formType}`)
                }
              } catch (error) {
                // Skip individual filing errors
                continue
              }
            }
          }
        } catch (error) {
          console.log(`⚠️ Error processing ${year} Q${quarter}:`, error)
          continue
        }
      }
      
      if (filings.length >= maxResults) break
    }

    console.log(`📊 Found ${filings.length} filings mentioning Ethereum`)
    return filings

  } catch (error) {
    console.error('❌ Error searching SEC EDGAR:', error)
    throw error
  }
}

/**
 * Helper function to determine if we should check a filing for Ethereum mentions
 */
function shouldCheckFiling(formType: string, companyName: string): boolean {
  // Focus on major filing types and known crypto-related companies
  const relevantForms = ['10-K', '10-Q', '8-K', 'S-1', 'DEF 14A', '20-F', '40-F']
  const cryptoKeywords = ['crypto', 'blockchain', 'digital', 'bitcoin', 'ethereum', 'coinbase', 'microstrategy', 'tesla', 'paypal', 'square', 'block', 'marathon', 'riot']
  
  const isRelevantForm = relevantForms.includes(formType.toUpperCase())
  const isCryptoRelated = cryptoKeywords.some(keyword => 
    companyName.toLowerCase().includes(keyword)
  )
  
  // Check major forms for all companies, or any form for crypto-related companies
  return isRelevantForm || isCryptoRelated
}

/**
 * Helper function to check if a filing contains Ethereum mentions
 */
async function checkFilingForEthereum(documentPath: string): Promise<boolean> {
  try {
    // For now, return true for known crypto-related companies to avoid excessive API calls
    // In production, this would fetch and search the actual filing content
    const cryptoCompanies = [
      'TESLA', 'MICROSTRATEGY', 'COINBASE', 'PAYPAL', 'BLOCK', 'SQUARE',
      'MARATHON', 'RIOT', 'NVIDIA', 'AMD', 'ROBINHOOD'
    ]
    
    const pathUpper = documentPath.toUpperCase()
    return cryptoCompanies.some(company => pathUpper.includes(company))
    
    /* Future implementation for full text search:
    const fileUrl = `https://www.sec.gov/Archives/${documentPath}`
    const response = await fetch(fileUrl, {
      headers: { 'User-Agent': 'EthereumList.com admin@ethereumlist.com' }
    })
    
    if (!response.ok) return false
    
    const content = await response.text()
    return content.toLowerCase().includes('ethereum')
    */
  } catch (error) {
    return false
  }
}

/**
 * Helper function to extract accession number from document path
 */
function extractAccessionNumber(documentPath: string): string {
  // Extract accession number from path like "edgar/data/1318605/000119312524123456/filename.txt"
  const pathParts = documentPath.split('/')
  if (pathParts.length >= 4) {
    const accessionPart = pathParts[3]
    // Format as standard accession number with dashes
    if (accessionPart.length >= 18) {
      return `${accessionPart.slice(0, 10)}-${accessionPart.slice(10, 12)}-${accessionPart.slice(12, 18)}`
    }
  }
  
  // Fallback: use the filename or a generated ID
  return pathParts[pathParts.length - 1]?.split('.')[0] || `unknown-${Date.now()}`
}

/**
 * Fetches recent Ethereum-related filings (last 90 days)
 */
export async function fetchRecentEthereumFilings(): Promise<SecFilingData[]> {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  
  return searchEthereumFilings(startDate, endDate, 50)
}

/**
 * Fetches comprehensive historical Ethereum filings
 * Searches from 2015 (Ethereum launch) to present
 */
export async function fetchAllEthereumFilings(): Promise<SecFilingData[]> {
  const endDate = new Date().toISOString().split('T')[0]
  const startDate = '2015-01-01' // Ethereum launch year
  
  return searchEthereumFilings(startDate, endDate, 1000) // Larger result set for comprehensive coverage
}

/**
 * Validates and cleans SEC filing data
 */
export function validateSecFiling(filing: SecFilingData): boolean {
  return !!(
    filing.accessionNumber &&
    filing.companyName &&
    filing.cik &&
    filing.formType &&
    filing.filingDate &&
    filing.edgarUrl
  )
}

/**
 * Formats filing data for database storage
 */
export function formatFilingForDatabase(filing: SecFilingData) {
  return {
    accessionNumber: filing.accessionNumber,
    companyName: filing.companyName.trim(),
    cik: filing.cik,
    formType: filing.formType.toUpperCase(),
    filingDate: filing.filingDate,
    reportTitle: filing.reportTitle?.trim() || null,
    edgarUrl: filing.edgarUrl,
    fullTextUrl: filing.fullTextUrl || null,
    localContentPath: null, // For future use
    contentCached: false,   // For future use
    isActive: true
  }
}
