import { NextRequest, NextResponse } from 'next/server'

interface SECFiling {
  accessionNumber: string
  filingDate: string
  reportDate: string
  acceptanceDateTime: string
  act: string
  form: string
  fileNumber: string
  filmNumber: string
  items: string
  size: string
  isXBRL: string
  isInlineXBRL: string
  primaryDocument: string
  primaryDocDescription: string
}

interface SECFilingsResponse {
  filings: {
    recent: {
      accessionNumber: string[]
      filingDate: string[]
      reportDate: string[]
      acceptanceDateTime: string[]
      act: string[]
      form: string[]
      fileNumber: string[]
      filmNumber: string[]
      items: string[]
      size: string[]
      isXBRL: string[]
      isInlineXBRL: string[]
      primaryDocument: string[]
      primaryDocDescription: string[]
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await params
    
    if (!ticker) {
      return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 })
    }

    // First, get the CIK (Central Index Key) for the ticker
    // SEC provides a company tickers JSON file
    const tickersResponse = await fetch(
      'https://www.sec.gov/files/company_tickers.json',
      {
        headers: {
          'User-Agent': 'Ethereum Treasury Tracker (contact@ethereumlist.com)'
        },
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    )

    if (!tickersResponse.ok) {
      throw new Error('Failed to fetch company tickers from SEC')
    }

    const tickersData = await tickersResponse.json()
    
    // Find the CIK for our ticker
    let cik: string | null = null
    for (const [key, company] of Object.entries(tickersData)) {
      const companyData = company as { cik_str: number; ticker: string; title: string }
      if (companyData.ticker?.toLowerCase() === ticker.toLowerCase()) {
        cik = companyData.cik_str.toString().padStart(10, '0')
        break
      }
    }

    if (!cik) {
      return NextResponse.json({ 
        error: 'Company not found in SEC database',
        filings: []
      }, { status: 404 })
    }

    // Fetch recent filings for the company
    const filingsResponse = await fetch(
      `https://data.sec.gov/submissions/CIK${cik}.json`,
      {
        headers: {
          'User-Agent': 'Ethereum Treasury Tracker (contact@ethereumlist.com)'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!filingsResponse.ok) {
      throw new Error('Failed to fetch filings from SEC')
    }

    const filingsData: SECFilingsResponse = await filingsResponse.json()
    
    // Process the filings data
    const recentFilings = filingsData.filings.recent
    const filings: SECFiling[] = []
    
    // Get the most recent 10 filings
    const maxFilings = Math.min(10, recentFilings.accessionNumber.length)
    
    for (let i = 0; i < maxFilings; i++) {
      filings.push({
        accessionNumber: recentFilings.accessionNumber[i],
        filingDate: recentFilings.filingDate[i],
        reportDate: recentFilings.reportDate[i],
        acceptanceDateTime: recentFilings.acceptanceDateTime[i],
        act: recentFilings.act[i],
        form: recentFilings.form[i],
        fileNumber: recentFilings.fileNumber[i],
        filmNumber: recentFilings.filmNumber[i],
        items: recentFilings.items[i],
        size: recentFilings.size[i],
        isXBRL: recentFilings.isXBRL[i],
        isInlineXBRL: recentFilings.isInlineXBRL[i],
        primaryDocument: recentFilings.primaryDocument[i],
        primaryDocDescription: recentFilings.primaryDocDescription[i]
      })
    }

    // Sort by filing date (most recent first)
    filings.sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime())

    return NextResponse.json({
      ticker: ticker.toUpperCase(),
      cik,
      filings,
      lastUpdate: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching SEC filings:', error)
    return NextResponse.json({
      error: 'Failed to fetch SEC filings',
      filings: []
    }, { status: 500 })
  }
}
