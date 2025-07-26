/**
 * Stock Data API Integration
 * Fetches real-time stock prices and company fundamentals
 */

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'

// Rate limiting: Alpha Vantage free tier allows 25 requests per day
const REQUEST_DELAY = 12000 // 12 seconds between requests

interface StockQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
}

interface CompanyOverview {
  symbol: string
  name: string
  marketCap: number
  sharesOutstanding: number
  peRatio: number
  bookValue: number
  dividendYield: number
}

interface StockData {
  quote: StockQuote
  overview: CompanyOverview
}

/**
 * Fetch with retry logic and rate limiting
 */
async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url)
      
      if (response.ok) {
        return response
      }
      
      if (response.status === 429) {
        // Rate limited, wait longer
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY * 2))
        continue
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  
  throw new Error('Max retries exceeded')
}

/**
 * Get real-time stock quote
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error('Alpha Vantage API key not configured')
  }

  const url = `${ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  
  try {
    const response = await fetchWithRetry(url)
    const data = await response.json()
    
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage API error: ${data['Error Message']}`)
    }
    
    if (data['Note']) {
      throw new Error('Alpha Vantage API rate limit exceeded')
    }
    
    const quote = data['Global Quote']
    if (!quote) {
      throw new Error('Invalid response format from Alpha Vantage API')
    }
    
    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume'])
    }
  } catch (error) {
    console.error(`Failed to fetch stock quote for ${symbol}:`, error)
    throw error
  }
}

/**
 * Get company overview with fundamentals
 */
export async function getCompanyOverview(symbol: string): Promise<CompanyOverview> {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error('Alpha Vantage API key not configured')
  }

  const url = `${ALPHA_VANTAGE_BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
  
  try {
    const response = await fetchWithRetry(url)
    const data = await response.json()
    
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage API error: ${data['Error Message']}`)
    }
    
    if (data['Note']) {
      throw new Error('Alpha Vantage API rate limit exceeded')
    }
    
    if (!data['Symbol']) {
      throw new Error('Invalid response format from Alpha Vantage API')
    }
    
    return {
      symbol: data['Symbol'],
      name: data['Name'],
      marketCap: parseInt(data['MarketCapitalization']) || 0,
      sharesOutstanding: parseInt(data['SharesOutstanding']) || 0,
      peRatio: parseFloat(data['PERatio']) || 0,
      bookValue: parseFloat(data['BookValue']) || 0,
      dividendYield: parseFloat(data['DividendYield']) || 0
    }
  } catch (error) {
    console.error(`Failed to fetch company overview for ${symbol}:`, error)
    throw error
  }
}

/**
 * Get complete stock data (quote + overview)
 * Falls back gracefully if overview fails
 */
export async function getStockData(symbol: string): Promise<StockData | null> {
  try {
    const quote = await getStockQuote(symbol)
    
    // Try to get overview, but don't fail if it doesn't work
    let overview: CompanyOverview | null = null
    try {
      await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY))
      overview = await getCompanyOverview(symbol)
    } catch (overviewError) {
      console.warn(`Failed to fetch overview for ${symbol}, using quote only:`, overviewError)
      // Create a minimal overview with defaults
      overview = {
        symbol,
        name: symbol,
        marketCap: 0,
        sharesOutstanding: 0,
        peRatio: 0,
        bookValue: 0,
        dividendYield: 0
      }
    }
    
    return { quote, overview }
  } catch (error) {
    console.error(`Failed to fetch stock data for ${symbol}:`, error)
    return null
  }
}

/**
 * Update stock data for multiple companies with rate limiting
 */
export async function updateMultipleStockData(symbols: string[]): Promise<Map<string, StockData>> {
  const results = new Map<string, StockData>()
  
  for (const symbol of symbols) {
    try {
      console.log(`Fetching stock data for ${symbol}...`)
      const stockData = await getStockData(symbol)
      if (stockData) {
        results.set(symbol, stockData)
      }
      
      // Rate limiting: wait between requests
      if (symbols.indexOf(symbol) < symbols.length - 1) {
        await new Promise(resolve => setTimeout(resolve, REQUEST_DELAY))
      }
    } catch (error) {
      console.error(`Failed to fetch stock data for ${symbol}:`, error)
      // Continue with other symbols even if one fails
    }
  }
  
  return results
}

/**
 * Health check for stock data API
 */
export async function checkStockApiHealth(): Promise<boolean> {
  if (!ALPHA_VANTAGE_API_KEY) {
    return false
  }
  
  try {
    // Test with a simple quote request for a major stock
    await getStockQuote('AAPL')
    return true
  } catch (error) {
    console.error('Stock API health check failed:', error)
    return false
  }
}
