// API service utilities for external data sources
import { Company } from '@/types/company'
import { getApiKey } from '@/lib/apiKeys'

// API base URLs
const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/api'
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

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
  const etherscanApiKey = await getApiKey('etherscan')
  if (!etherscanApiKey) {
    throw new Error('Etherscan API key not configured')
  }

  const url = `${ETHERSCAN_BASE_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanApiKey}`
  
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
  const coingeckoApiKey = await getApiKey('coingecko')
  const url = `${COINGECKO_BASE_URL}/simple/price?ids=ethereum&vs_currencies=usd`
  const headers: HeadersInit = {}
  if (coingeckoApiKey) {
    headers['x-cg-demo-api-key'] = coingeckoApiKey
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
 * Get market data for a stock symbol from a financial API
 * Note: This would typically use Alpha Vantage or similar service
 */
export async function getStockPrice(symbol: string): Promise<{ price: number; marketCap: number } | null> {
  // Placeholder for stock API integration
  // In production, this would connect to Alpha Vantage, Yahoo Finance API, etc.
  console.warn(`Stock price API not implemented for ${symbol}`)
  return null
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
  const etherscanApiKey = await getApiKey('etherscan')
  if (!etherscanApiKey) {
    throw new Error('Etherscan API key not configured')
  }

  const url = `${ETHERSCAN_BASE_URL}?module=stats&action=ethsupply&apikey=${etherscanApiKey}`
  
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
    const etherscanApiKey = await getApiKey('etherscan')
    if (etherscanApiKey) {
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
