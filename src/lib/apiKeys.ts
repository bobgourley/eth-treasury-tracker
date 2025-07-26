import crypto from 'crypto'
import { prisma } from '@/lib/db'

// Encryption key for API keys (in production, use a proper secret management system)
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_SECRET || 'default-secret-key-change-in-production'
const ALGORITHM = 'aes-256-gcm'

/**
 * Encrypt an API key for secure storage
 */
function encryptApiKey(apiKey: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

/**
 * Decrypt an API key from storage
 */
function decryptApiKey(encryptedKey: string): string {
  try {
    const [ivHex, encrypted] = encryptedKey.split(':')
    const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Failed to decrypt API key:', error)
    return ''
  }
}

/**
 * Store an API key securely in the database
 */
export async function storeApiKey(name: string, key: string, description?: string): Promise<boolean> {
  try {
    const encryptedKey = encryptApiKey(key)
    
    await prisma.apiKey.upsert({
      where: { name },
      update: {
        key: encryptedKey,
        description,
        isActive: true,
        updatedAt: new Date()
      },
      create: {
        name,
        key: encryptedKey,
        description,
        isActive: true
      }
    })
    
    return true
  } catch (error) {
    console.error('Failed to store API key:', error)
    return false
  }
}

/**
 * Retrieve an API key from the database
 */
export async function getApiKey(name: string): Promise<string | null> {
  try {
    const apiKeyRecord = await prisma.apiKey.findUnique({
      where: { name, isActive: true }
    })
    
    if (!apiKeyRecord) {
      return null
    }
    
    return decryptApiKey(apiKeyRecord.key)
  } catch (error) {
    console.error('Failed to retrieve API key:', error)
    return null
  }
}

/**
 * Get all API keys (without decrypting the actual keys)
 */
export async function getAllApiKeys(): Promise<Array<{
  id: number
  name: string
  description: string | null
  isActive: boolean
  hasKey: boolean
  createdAt: Date
  updatedAt: Date
}>> {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { name: 'asc' }
    })
    
    return apiKeys.map(key => ({
      id: key.id,
      name: key.name,
      description: key.description,
      isActive: key.isActive,
      hasKey: key.key.length > 0,
      createdAt: key.createdAt,
      updatedAt: key.updatedAt
    }))
  } catch (error) {
    console.error('Failed to retrieve API keys:', error)
    return []
  }
}

/**
 * Delete an API key
 */
export async function deleteApiKey(name: string): Promise<boolean> {
  try {
    await prisma.apiKey.update({
      where: { name },
      data: { isActive: false }
    })
    
    return true
  } catch (error) {
    console.error('Failed to delete API key:', error)
    return false
  }
}

/**
 * Test if an API key is valid by making a test request
 */
export async function testApiKey(name: string, key: string): Promise<{ valid: boolean; error?: string }> {
  try {
    switch (name) {
      case 'etherscan':
        const etherscanUrl = `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${key}`
        const etherscanResponse = await fetch(etherscanUrl)
        const etherscanData = await etherscanResponse.json()
        
        if (etherscanData.status === '1') {
          return { valid: true }
        } else {
          return { valid: false, error: etherscanData.message || 'Invalid Etherscan API key' }
        }
        
      case 'coingecko':
        const coingeckoUrl = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
        const headers: HeadersInit = {}
        if (key) {
          headers['x-cg-demo-api-key'] = key
        }
        
        const coingeckoResponse = await fetch(coingeckoUrl, { headers })
        const coingeckoData = await coingeckoResponse.json()
        
        if (coingeckoData.ethereum?.usd) {
          return { valid: true }
        } else {
          return { valid: false, error: 'Invalid CoinGecko API key or API error' }
        }
        
      default:
        return { valid: false, error: 'Unknown API key type' }
    }
  } catch (error) {
    return { valid: false, error: `Test failed: ${error}` }
  }
}

/**
 * Initialize default API key entries
 */
export async function initializeDefaultApiKeys(): Promise<void> {
  const defaultKeys = [
    {
      name: 'etherscan',
      description: 'Etherscan API for Ethereum blockchain data and ETH balances'
    },
    {
      name: 'coingecko',
      description: 'CoinGecko API for cryptocurrency prices and market data'
    },
    {
      name: 'alpha_vantage',
      description: 'Alpha Vantage API for stock market data and financial information'
    }
  ]
  
  for (const keyInfo of defaultKeys) {
    try {
      await prisma.apiKey.upsert({
        where: { name: keyInfo.name },
        update: {},
        create: {
          name: keyInfo.name,
          key: '', // Empty key initially
          description: keyInfo.description,
          isActive: false // Inactive until a key is provided
        }
      })
    } catch (error) {
      console.error(`Failed to initialize ${keyInfo.name} API key entry:`, error)
    }
  }
}
