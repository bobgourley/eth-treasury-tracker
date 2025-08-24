// API service utilities for external data sources
import { Company } from '@/types/company'
import { callWithRateLimit } from './rateLimiter'

// Etherscan API configuration
const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/api'
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

// CoinGecko API configuration  
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'
const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY

// Rate limiting and retry configuration
const RATE_LIMIT_DELAY = 200 // ms between requests
const MAX_RETRIES = 3

/**
 * Utility function to add delay between API calls
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Utility function for API requests with retry logic
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return response
  } catch (error) {
    if (retries > 0) {
      console.warn(`API request failed, retrying... (${retries} attempts left)`)
      await delay(RATE_LIMIT_DELAY * 2) // Exponential backoff
      return fetchWithRetry(url, options, retries - 1)
    }
    throw error
  }
}

/**
 * Get ETH balance for a specific address using Etherscan API
 */
export async function getEthBalance(address: string): Promise<number> {
  if (!ETHERSCAN_API_KEY) {
    throw new Error('Etherscan API key not configured')
  }

  const url = `${ETHERSCAN_BASE_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
  
  try {
    const response = await fetchWithRetry(url)
    const data = await response.json()
    
    if (data.status !== '1') {
      throw new Error(`Etherscan API error: ${data.message}`)
    }
    
    // Convert from wei to ETH
    const balanceWei = BigInt(data.result)
    const balanceEth = Number(balanceWei) / 1e18
    
    return balanceEth
  } catch (error) {
    console.error(`Failed to fetch ETH balance for ${address}:`, error)
    throw error
  }
}

/**
 * Get multiple ETH balances in a single batch request
 */
export async function getBatchEthBalances(addresses: string[]): Promise<Record<string, number>> {
  if (!ETHERSCAN_API_KEY) {
    throw new Error('Etherscan API key not configured')
  }

  const balances: Record<string, number> = {}
  
  // Process addresses in batches to respect rate limits
  for (const address of addresses) {
    try {
      balances[address] = await getEthBalance(address)
      await delay(RATE_LIMIT_DELAY) // Rate limiting
    } catch (error) {
      console.error(`Failed to fetch balance for ${address}:`, error)
      balances[address] = 0 // Default to 0 on error
    }
  }
  
  return balances
}

/**
 * Get current ETH price in USD using CoinGecko API
 */
export async function getEthPrice(): Promise<number> {
  const url = `${COINGECKO_BASE_URL}/simple/price?ids=ethereum&vs_currencies=usd`
  
  const headers: HeadersInit = {}
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY
  }
  
  try {
    const response = await fetchWithRetry(url, { headers })
    const data = await response.json()
    
    if (!data.ethereum?.usd) {
      throw new Error('Invalid response from CoinGecko API')
    }
    
    return data.ethereum.usd
  } catch (error) {
    console.error('Failed to fetch ETH price:', error)
    throw error
  }
}

/**
 * Get current Bitcoin price in USD using CoinGecko API
 */
export async function getBitcoinPrice(): Promise<number> {
  const url = `${COINGECKO_BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd`
  
  const headers: HeadersInit = {}
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY
  }
  
  try {
    const response = await fetchWithRetry(url, { headers })
    const data = await response.json()
    
    if (!data.bitcoin?.usd) {
      throw new Error('Invalid response from CoinGecko API')
    }
    
    return data.bitcoin.usd
  } catch (error) {
    console.error('Failed to fetch Bitcoin price:', error)
    throw error
  }
}

/**
 * Get market data for both ETH and BTC in a single call
 */
export async function getCryptoMarketData(): Promise<{
  ethPrice: number
  ethMarketCap: number
  bitcoinPrice: number
  bitcoinMarketCap: number
}> {
  const url = `${COINGECKO_BASE_URL}/simple/price?ids=ethereum,bitcoin&vs_currencies=usd&include_market_cap=true`
  
  const headers: HeadersInit = {}
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY
  }
  
  try {
    const response = await fetchWithRetry(url, { headers })
    const data = await response.json()
    
    if (!data.ethereum?.usd || !data.bitcoin?.usd) {
      throw new Error('Invalid response from CoinGecko API')
    }
    
    return {
      ethPrice: data.ethereum.usd,
      ethMarketCap: data.ethereum.usd_market_cap,
      bitcoinPrice: data.bitcoin.usd,
      bitcoinMarketCap: data.bitcoin.usd_market_cap
    }
  } catch (error) {
    console.error('Failed to fetch crypto market data:', error)
    throw error
  }
}

/**
 * Get ETH staking data from CoinGecko API
 */
export async function getEthStakingData(): Promise<{ stakedEth: number; stakingApr: number }> {
  const url = `${COINGECKO_BASE_URL}/coins/ethereum`
  
  const headers: HeadersInit = {}
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY
  }
  
  try {
    const response = await fetchWithRetry(url, { headers })
    const data = await response.json()
    
    // Get staked ETH from market data or use estimated value
    const stakedEth = data.market_data?.total_value_locked || 32000000 // ~32M ETH estimated
    const stakingApr = data.market_data?.staking_rewards_apr || 3.2 // ~3.2% estimated
    
    return {
      stakedEth,
      stakingApr
    }
  } catch (error) {
    console.error('Failed to fetch ETH staking data:', error)
    // Return fallback values
    return {
      stakedEth: 32000000, // 32M ETH
      stakingApr: 3.2 // 3.2%
    }
  }
}

/**
 * Get market data for a stock symbol from Alpha Vantage API
 * Returns stock price and market cap, with proper error handling for rate limits
 */
export async function getStockPrice(symbol: string): Promise<{ price: number; marketCap: number } | null> {
  const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY
  
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not configured')
    return null
  }

  return callWithRateLimit('alpha_vantage', `stock-${symbol}`, async () => {
    console.log(`Fetching stock data for ${symbol} from Alpha Vantage...`)
    
    // First, get the stock quote for current price
    const quoteUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    
    const quoteResponse = await fetch(quoteUrl, {
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000)
    })

    if (!quoteResponse.ok) {
      throw new Error(`Alpha Vantage API returned ${quoteResponse.status}`)
    }

    const quoteData = await quoteResponse.json()
    
    // Check for API rate limit or error
    if (quoteData['Error Message']) {
      throw new Error(`Alpha Vantage Error: ${quoteData['Error Message']}`)
    }
    
    if (quoteData['Note']) {
      throw new Error(`Alpha Vantage rate limit: ${quoteData['Note']}`)
    }

    const globalQuote = quoteData['Global Quote']
    if (!globalQuote) {
      throw new Error('Invalid response format from Alpha Vantage Global Quote')
    }

    const price = parseFloat(globalQuote['05. price'] || '0')
    
    // Get company overview for market cap (second API call with rate limiting)
    return callWithRateLimit('alpha_vantage', `overview-${symbol}`, async () => {
      const overviewUrl = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      
      const overviewResponse = await fetch(overviewUrl, {
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000)
      })

      if (!overviewResponse.ok) {
        throw new Error(`Alpha Vantage Overview API returned ${overviewResponse.status}`)
      }

      const overviewData = await overviewResponse.json()
      
      if (overviewData['Error Message']) {
        throw new Error(`Alpha Vantage Overview Error: ${overviewData['Error Message']}`)
      }
      
      if (overviewData['Note']) {
        throw new Error(`Alpha Vantage overview rate limit: ${overviewData['Note']}`)
      }

      const marketCap = parseFloat(overviewData['MarketCapitalization'] || '0')
      
      if (price > 0) {
        console.log(`✅ Alpha Vantage data for ${symbol}: Price=$${price}, MarketCap=$${marketCap.toLocaleString()}`)
        return { price, marketCap }
      } else {
        throw new Error('Invalid price data received')
      }
    })
  }).catch(error => {
    console.error(`❌ Failed to fetch stock data for ${symbol}:`, error)
    return null
  })
}

/**
 * Validate Ethereum address format
 */
export function isValidEthAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Get total ETH supply from Etherscan
 */
export async function getTotalEthSupply(): Promise<number> {
  if (!ETHERSCAN_API_KEY) {
    throw new Error('Etherscan API key not configured')
  }

  const url = `${ETHERSCAN_BASE_URL}?module=stats&action=ethsupply&apikey=${ETHERSCAN_API_KEY}`
  
  try {
    const response = await fetchWithRetry(url)
    const data = await response.json()
    
    if (data.status !== '1') {
      throw new Error(`Etherscan API error: ${data.message}`)
    }
    
    // Convert from wei to ETH
    const supplyWei = BigInt(data.result)
    const supplyEth = Number(supplyWei) / 1e18
    
    return supplyEth
  } catch (error) {
    console.error('Failed to fetch total ETH supply:', error)
    throw error
  }
}

/**
 * Update company ETH holdings from blockchain data
 */
export async function updateCompanyEthHoldings(companies: Company[]): Promise<Company[]> {
  const updatedCompanies: Company[] = []
  
  for (const company of companies) {
    try {
      // Parse addresses from JSON string or use single address
      let addresses: string[] = []
      
      if (company.ethAddresses) {
        try {
          addresses = JSON.parse(company.ethAddresses)
        } catch {
          // If parsing fails, treat as single address
          addresses = [company.ethAddresses]
        }
      }
      
      if (addresses.length > 0) {
        let totalBalance = 0
        
        // Sum balances from all addresses
        for (const address of addresses) {
          if (isValidEthAddress(address)) {
            const balance = await getEthBalance(address)
            totalBalance += balance
            await delay(RATE_LIMIT_DELAY) // Rate limiting
          }
        }
        
        updatedCompanies.push({
          ...company,
          ethHoldings: totalBalance,
          lastUpdated: new Date()
        })
        
        console.log(`Updated ${company.name}: ${totalBalance} ETH from ${addresses.length} addresses`)
      } else {
        console.warn(`No valid ETH addresses found for ${company.name}`)
        updatedCompanies.push(company)
      }
      
    } catch (error) {
      console.error(`Failed to update ETH holdings for ${company.name}:`, error)
      updatedCompanies.push(company) // Keep existing data on error
    }
  }
  
  return updatedCompanies
}

/**
 * Health check for external APIs
 */
export async function checkApiHealth(): Promise<{
  etherscan: boolean
  coingecko: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let etherscanHealthy = false
  let coingeckoHealthy = false
  
  // Test Etherscan API
  try {
    if (ETHERSCAN_API_KEY) {
      await getTotalEthSupply()
      etherscanHealthy = true
    } else {
      errors.push('Etherscan API key not configured')
    }
  } catch (error) {
    errors.push(`Etherscan API error: ${error}`)
  }
  
  // Test CoinGecko API
  try {
    await getEthPrice()
    coingeckoHealthy = true
  } catch (error) {
    errors.push(`CoinGecko API error: ${error}`)
  }
  
  return {
    etherscan: etherscanHealthy,
    coingecko: coingeckoHealthy,
    errors
  }
}
