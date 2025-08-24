import { PrismaClient } from '@prisma/client'
import { FALLBACK_ETH_SUPPLY } from './constants'

interface CoinGeckoResponse {
  ethereum: {
    usd: number
    usd_24h_change: number
    last_updated_at: number
  }
}

interface EtherscanSupplyResponse {
  status: string
  message: string
  result: string
}

/**
 * Fetches real ETH price from CoinGecko API
 */
export async function fetchEthPrice(): Promise<number | null> {
  try {
    console.log('🔄 Fetching ETH price from CoinGecko...')
    
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true',
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EthereumList.com/1.0'
        }
      }
    )
    
    if (!response.ok) {
      console.error('❌ CoinGecko API error:', response.status, response.statusText)
      return null
    }
    
    const data: CoinGeckoResponse = await response.json()
    const ethPrice = data.ethereum?.usd
    
    if (typeof ethPrice === 'number' && ethPrice > 0) {
      console.log(`✅ ETH price fetched: $${ethPrice.toFixed(2)}`)
      return ethPrice
    } else {
      console.error('❌ Invalid ETH price data from CoinGecko:', data)
      return null
    }
    
  } catch (error) {
    console.error('❌ Error fetching ETH price from CoinGecko:', error)
    return null
  }
}

/**
 * Fetches real ETH supply from Etherscan API
 */
export async function fetchEthSupply(): Promise<number | null> {
  try {
    console.log('🔄 Fetching ETH supply from Etherscan...')
    
    const etherscanApiKey = process.env.ETHERSCAN_API_KEY
    if (!etherscanApiKey) {
      console.log('⚠️ No Etherscan API key found, skipping ETH supply fetch')
      return null
    }
    
    const response = await fetch(
      `https://api.etherscan.io/api?module=stats&action=ethsupply&apikey=${etherscanApiKey}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'EthereumList.com/1.0'
        }
      }
    )
    
    if (!response.ok) {
      console.error('❌ Etherscan API error:', response.status, response.statusText)
      return null
    }
    
    const data: EtherscanSupplyResponse = await response.json()
    
    if (data.status === '1' && data.result) {
      // Convert from wei to ETH
      const ethSupply = parseInt(data.result) / 1e18
      console.log(`✅ ETH supply fetched: ${ethSupply.toLocaleString()} ETH`)
      return ethSupply
    } else {
      console.error('❌ Invalid ETH supply data from Etherscan:', data)
      return null
    }
    
  } catch (error) {
    console.error('❌ Error fetching ETH supply from Etherscan:', error)
    return null
  }
}

/**
 * Updates system metrics in database with latest data from APIs
 */
export async function updateSystemMetrics(): Promise<void> {
  const prisma = new PrismaClient()
  try {
    console.log('🔄 Updating system metrics from live APIs...')
    
    // Fetch live data
    const [ethPrice, ethSupply] = await Promise.all([
      fetchEthPrice(),
      fetchEthSupply()
    ])
    
    // Get current system metrics for fallback values
    const currentMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })
    
    // Use live data if available, otherwise keep existing database values
    const updatedEthPrice = ethPrice || currentMetrics?.ethPrice
    if (!updatedEthPrice) {
      throw new Error('No ETH price available from API or database - cannot update system metrics')
    }
    
    // Use live ETH supply from API, or get from database if API fails
    let updatedEthSupply = ethSupply
    if (!updatedEthSupply) {
      // Try to get the last known ETH supply from EcosystemSummary table
      const lastEcosystemData = await prisma.ecosystemSummary.findFirst({
        orderBy: { lastUpdated: 'desc' },
        select: { ethSupply: true }
      })
      updatedEthSupply = lastEcosystemData?.ethSupply || FALLBACK_ETH_SUPPLY // Only fallback if no database data exists
      console.log(`📊 Using ETH supply from database: ${updatedEthSupply.toLocaleString()} ETH`)
    }
    
    // Calculate company totals for system metrics
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: { ethHoldings: true, marketCap: true }
    })
    
    const totalEthHoldings = companies.reduce((sum: number, company: { ethHoldings: number | null; marketCap: bigint | null }) => sum + Number(company.ethHoldings || 0), 0)
    const totalMarketCap = companies.reduce((sum: number, company: { ethHoldings: number | null; marketCap: bigint | null }) => sum + Number(company.marketCap || 0), 0)
    const totalEthValue = totalEthHoldings * updatedEthPrice
    const ethSupplyPercent = (totalEthHoldings / updatedEthSupply) * 100
    
    // Update or create system metrics record
    await prisma.systemMetrics.upsert({
      where: { id: currentMetrics?.id || 1 },
      update: {
        ethPrice: updatedEthPrice,
        totalEthHoldings,
        totalCompanies: companies.length,
        totalEthValue,
        totalMarketCap,
        ethSupplyPercent,
        lastUpdate: new Date()
      },
      create: {
        ethPrice: updatedEthPrice,
        totalEthHoldings,
        totalCompanies: companies.length,
        totalEthValue,
        totalMarketCap,
        ethSupplyPercent,
        lastUpdate: new Date()
      }
    })
    
    // Also update/create EcosystemSummary with the latest ETH supply data
    // This ensures all pages can read ETH supply from database consistently
    await prisma.ecosystemSummary.upsert({
      where: { id: 1 }, // Single record for ecosystem data
      update: {
        ethPrice: updatedEthPrice,
        ethSupply: updatedEthSupply,
        totalTrackedEth: totalEthHoldings,
        totalTrackedPercentage: ethSupplyPercent,
        companyCount: companies.length,
        companyTotalEth: totalEthHoldings,
        companyTotalValue: totalEthValue,
        companyPercentage: ethSupplyPercent,
        etfCount: 0, // Will be updated by ETF system separately
        etfTotalEth: 0,
        etfTotalValue: 0,
        etfPercentage: 0,
        lastUpdated: new Date()
      },
      create: {
        ethPrice: updatedEthPrice,
        ethSupply: updatedEthSupply,
        totalTrackedEth: totalEthHoldings,
        totalTrackedPercentage: ethSupplyPercent,
        companyCount: companies.length,
        companyTotalEth: totalEthHoldings,
        companyTotalValue: totalEthValue,
        companyPercentage: ethSupplyPercent,
        etfCount: 0,
        etfTotalEth: 0,
        etfTotalValue: 0,
        etfPercentage: 0,
        lastUpdated: new Date()
      }
    })
    
    console.log(`✅ System metrics updated:`)
    console.log(`   ETH Price: $${updatedEthPrice.toFixed(2)} ${ethPrice ? '(live)' : '(fallback)'}`)
    console.log(`   ETH Supply: ${updatedEthSupply.toLocaleString()} ETH ${ethSupply ? '(live)' : '(fallback)'}`)
    console.log(`   Companies: ${companies.length} holding ${totalEthHoldings.toLocaleString()} ETH`)
    console.log(`   Total Value: $${totalEthValue.toLocaleString()}`)
    console.log(`   Supply %: ${ethSupplyPercent.toFixed(3)}%`)
    
  } catch (error) {
    console.error('❌ Error updating system metrics:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Gets the latest ETH price from database (with live API as backup)
 */
export async function getLatestEthPrice(): Promise<number> {
  const prisma = new PrismaClient()
  try {
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' },
      select: { ethPrice: true, lastUpdate: true }
    })
    
    if (systemMetrics?.ethPrice) {
      const ageMinutes = (Date.now() - systemMetrics.lastUpdate.getTime()) / (1000 * 60)
      
      // If data is older than 30 minutes, try to fetch fresh data
      if (ageMinutes > 30) {
        console.log(`⚠️ ETH price data is ${ageMinutes.toFixed(0)} minutes old, fetching fresh data...`)
        const freshPrice = await fetchEthPrice()
        if (freshPrice) {
          return freshPrice
        }
      }
      
      return systemMetrics.ethPrice
    }
    
    // No database data, fetch from API
    console.log('⚠️ No ETH price in database, fetching from API...')
    const livePrice = await fetchEthPrice()
    if (livePrice) {
      return livePrice
    }
    
    // No API data available - this is a critical error
    throw new Error('No ETH price available from database or API')
    
  } catch (error) {
    console.error('❌ Error getting latest ETH price:', error)
    throw error // No hardcoded fallbacks - database/API is required
  } finally {
    await prisma.$disconnect()
  }
}
