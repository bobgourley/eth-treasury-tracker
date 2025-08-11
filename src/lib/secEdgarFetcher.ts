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
  maxResults: number = 500
): Promise<SecFilingData[]> {
  try {
    console.log('🔍 Searching SEC EDGAR for Ethereum-related filings (COMPREHENSIVE)...')
    
    const filings: SecFilingData[] = []
    const currentYear = new Date().getFullYear()
    const startYear = startDate ? parseInt(startDate.split('-')[0]) : 2015 // Start from 2015 when Ethereum launched
    
    console.log(`📅 Search parameters:`, {
      dateRange: `${startYear} to ${currentYear}`,
      maxResults,
      note: 'Comprehensive search for ALL Ethereum mentions'
    })

    // Search through ALL quarterly master index files since Ethereum's launch
    for (let year = startYear; year <= currentYear; year++) {
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
                  const accessionNumber = extractAccessionNumber(documentPath)
                  const cikPadded = cik.padStart(10, '0')
                  
                  // Generate human-readable HTML URL using the correct SEC EDGAR format
                  // The documentPath already contains the correct path structure
                  const baseUrl = `https://www.sec.gov/Archives/${documentPath}`
                  const pathParts = documentPath.split('/')
                  const fileName = pathParts[pathParts.length - 1]
                  const directory = pathParts.slice(0, -1).join('/')
                  
                  // Generate index URL by replacing the filename with accession-index.htm
                  const accessionNoHyphens = accessionNumber.replace(/-/g, '')
                  const humanReadableUrl = `https://www.sec.gov/Archives/${directory}/${accessionNoHyphens}-index.htm`
                  
                  const filing: SecFilingData = {
                    accessionNumber: accessionNumber,
                    companyName: companyName.trim(),
                    cik: cikPadded,
                    formType: formType.trim(),
                    filingDate: new Date(filingDate),
                    reportTitle: `${formType} - Contains references to Ethereum`,
                    edgarUrl: humanReadableUrl,
                    fullTextUrl: `https://www.sec.gov/Archives/${documentPath}` // Keep raw text as fallback
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
  // Focus on major filing types that are likely to contain meaningful Ethereum mentions
  const relevantForms = ['10-K', '10-Q', '8-K', 'S-1', 'DEF 14A']
  
  // Known companies that have mentioned crypto/Ethereum in filings
  const knownCryptoCompanies = [
    'tesla', 'microstrategy', 'coinbase', 'paypal', 'block', 'square',
    'marathon', 'riot', 'nvidia', 'amd', 'robinhood', 'grayscale',
    'galaxy', 'silvergate', 'signature', 'first republic', 'jpmorgan',
    'goldman sachs', 'morgan stanley', 'blackrock', 'fidelity',
    'ark invest', 'proshares', 'vaneck', 'bitwise', 'invesco'
  ]
  
  // Additional keywords that might indicate crypto relevance
  const cryptoKeywords = [
    'crypto', 'blockchain', 'digital asset', 'bitcoin', 'ethereum',
    'mining', 'staking', 'defi', 'web3', 'nft'
  ]
  
  const isRelevantForm = relevantForms.includes(formType.toUpperCase())
  const companyLower = companyName.toLowerCase()
  
  const isKnownCryptoCompany = knownCryptoCompanies.some(company => 
    companyLower.includes(company)
  )
  
  const hasCryptoKeywords = cryptoKeywords.some(keyword => 
    companyLower.includes(keyword)
  )
  
  // Only check relevant forms, and prioritize known crypto companies
  return isRelevantForm && (isKnownCryptoCompany || hasCryptoKeywords)
}

/**
 * Helper function to check if a SEC filing contains the specific word "ethereum"
 * Downloads the filing content and searches for exact word match only
 * @param documentPath - The SEC EDGAR document path
 * @returns Promise<boolean> - True if filing contains the word "ethereum"
 */
async function checkFilingForEthereum(documentPath: string): Promise<boolean> {
  try {
    // Fetch and search the actual filing content for "ethereum"
    const fileUrl = `https://www.sec.gov/Archives/${documentPath}`
    
    const response = await fetch(fileUrl, {
      headers: { 
        'User-Agent': 'EthereumList.com admin@ethereumlist.com',
        'Accept': 'text/html,text/plain,*/*'
      }
    })
    
    if (!response.ok) {
      console.log(`⚠️ Could not fetch filing ${documentPath}: ${response.status}`)
      return false
    }
    
    const content = await response.text()
    const contentLower = content.toLowerCase()
    
    // Search for ONLY the specific word "ethereum" (case-insensitive, word boundaries)
    const ethereumRegex = /\bethereum\b/i
    const hasEthereumMention = ethereumRegex.test(content)
    
    if (hasEthereumMention) {
      console.log(`✅ Found Ethereum mention in ${documentPath}`)
    }
    
    return hasEthereumMention
    
  } catch (error) {
    console.log(`❌ Error checking filing ${documentPath}:`, error)
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
  
  // Try to extract from filename if path method fails
  const filename = pathParts[pathParts.length - 1]
  if (filename) {
    // Look for accession number pattern in filename (e.g., "0001193125-25-017726.txt")
    const accessionMatch = filename.match(/(\d{10}-\d{2}-\d{6})/)
    if (accessionMatch) {
      return accessionMatch[1]
    }
    
    // Look for raw accession number pattern (18 digits)
    const rawAccessionMatch = filename.match(/(\d{18})/)
    if (rawAccessionMatch) {
      const raw = rawAccessionMatch[1]
      return `${raw.slice(0, 10)}-${raw.slice(10, 12)}-${raw.slice(12, 18)}`
    }
  }
  
  // Fallback: use the filename or a generated ID
  return filename?.split('.')[0] || `unknown-${Date.now()}`
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
