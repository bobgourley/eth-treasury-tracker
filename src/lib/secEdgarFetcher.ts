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
 * Uses the SEC's full-text search API
 */
export async function searchEthereumFilings(
  startDate?: string,
  endDate?: string,
  maxResults: number = 100
): Promise<SecFilingData[]> {
  try {
    console.log('🔍 Searching SEC EDGAR for Ethereum-related filings...')
    
    // Construct search query
    const query = {
      q: 'ethereum',
      dateRange: startDate && endDate ? `${startDate}:${endDate}` : 'all',
      category: 'custom',
      startdt: startDate || '2015-01-01', // Ethereum launch year
      enddt: endDate || new Date().toISOString().split('T')[0],
      forms: [], // Empty means all forms
      from: 0,
      size: maxResults
    }

    console.log(`📅 Search parameters:`, {
      query: query.q,
      dateRange: `${query.startdt} to ${query.enddt}`,
      maxResults
    })

    // SEC EDGAR search endpoint
    const searchUrl = 'https://efts.sec.gov/LATEST/search/index'
    
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'EthereumList.com admin@ethereumlist.com',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(query)
    })

    if (!response.ok) {
      console.error('❌ SEC EDGAR API error:', response.status, response.statusText)
      throw new Error(`SEC EDGAR API error: ${response.status} ${response.statusText}`)
    }

    const data: EdgarSearchResult = await response.json()
    
    console.log(`✅ Found ${data.hits.total.value} total filings mentioning "ethereum"`)
    console.log(`📄 Processing ${data.filings?.length || 0} filings from current page`)

    if (!data.filings || data.filings.length === 0) {
      console.log('⚠️ No filings found in response')
      return []
    }

    // Process and normalize the filing data
    const processedFilings: SecFilingData[] = data.filings.map(filing => {
      const source = filing._source
      const accessionNumber = source.accession_num
      const cik = source.cik.padStart(10, '0') // Ensure CIK is 10 digits
      
      // Construct EDGAR URLs
      const edgarUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionNumber.replace(/-/g, '')}/${accessionNumber}-index.htm`
      const fullTextUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(cik)}/${accessionNumber.replace(/-/g, '')}/${accessionNumber}.txt`

      return {
        accessionNumber,
        companyName: source.company_name || 'Unknown Company',
        cik,
        formType: source.form || 'Unknown',
        filingDate: new Date(source.file_date),
        reportTitle: source.file_description || source.items || `${source.form} Filing`,
        edgarUrl,
        fullTextUrl
      }
    })

    console.log(`🎯 Processed ${processedFilings.length} filings successfully`)
    
    // Log sample of results for debugging
    if (processedFilings.length > 0) {
      console.log('📋 Sample filing:', {
        company: processedFilings[0].companyName,
        form: processedFilings[0].formType,
        date: processedFilings[0].filingDate.toISOString().split('T')[0],
        accession: processedFilings[0].accessionNumber
      })
    }

    return processedFilings

  } catch (error) {
    console.error('❌ Error searching SEC EDGAR for Ethereum filings:', error)
    throw error
  }
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
