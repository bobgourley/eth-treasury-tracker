// API Key Management - Simplified for Environment Variables
// All API keys are now managed through environment variables for security

/**
 * Get API key from environment variables
 */
export function getApiKey(name: string): string | null {
  switch (name.toLowerCase()) {
    case 'etherscan':
      return process.env.ETHERSCAN_API_KEY || null
    case 'coingecko':
      return process.env.COINGECKO_API_KEY || null
    case 'alpha_vantage':
    case 'alphavantage':
      return process.env.ALPHA_VANTAGE_API_KEY || null
    default:
      return null
  }
}

/**
 * Store an API key (disabled - using environment variables)
 */
export async function storeApiKey(name: string, key: string, description?: string): Promise<boolean> {
  console.log(`API key storage disabled for ${name} - using environment variables`)
  return true
}

/**
 * Get all API keys (disabled - using environment variables)
 */
export async function getAllApiKeys(): Promise<never[]> {
  console.log('API key listing disabled - using environment variables')
  return []
}

/**
 * Delete an API key (disabled - using environment variables)
 */
export async function deleteApiKey(name: string): Promise<boolean> {
  console.log(`API key deletion disabled for ${name} - using environment variables`)
  return true
}
