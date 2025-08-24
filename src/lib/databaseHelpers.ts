import { PrismaClient } from '@prisma/client'
import { FALLBACK_ETH_PRICE, FALLBACK_ETH_SUPPLY } from './constants'
import { prisma } from '@/lib/db'

/**
 * Get ETH price from database only - no external API calls
 * This ensures all pages show consistent pricing from the same source
 */
export async function getEthPriceFromDatabase(): Promise<number> {
  try {
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })
    
    if (systemMetrics?.ethPrice) {
      console.log(`📊 ETH price from database: $${systemMetrics.ethPrice}`)
      return systemMetrics.ethPrice
    }
    
    // If no database record exists, return a reasonable fallback
    // This should only happen on first deployment before any data is populated
    console.warn('⚠️ No ETH price found in database, using fallback')
    return FALLBACK_ETH_PRICE
  } catch (error) {
    console.error('❌ Error reading ETH price from database:', error)
    return FALLBACK_ETH_PRICE
  }
}

/**
 * Get total ETH supply from database only - no external API calls
 */
export async function getEthSupplyFromDatabase(): Promise<{ supply: number; source: string }> {
  try {
    const systemMetrics = await prisma.systemMetrics.findFirst({
      orderBy: { lastUpdate: 'desc' }
    })
    
    // For now, return static value since ETH supply isn't stored in SystemMetrics yet
    // TODO: Add ethSupply field to SystemMetrics table if needed
    return {
      supply: FALLBACK_ETH_SUPPLY, // Current approximate ETH supply
      source: 'database_static'
    }
  } catch (error) {
    console.error('❌ Error reading ETH supply from database:', error)
    return {
      supply: FALLBACK_ETH_SUPPLY,
      source: 'fallback'
    }
  }
}

/**
 * Get company data with calculated ETH values using database ETH price
 */
export async function getCompaniesWithEthValues() {
  try {
    const ethPrice = await getEthPriceFromDatabase()
    
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      orderBy: { ethHoldings: 'desc' }
    })
    
    return companies.map(company => ({
      ...company,
      ethValue: (company.ethHoldings || 0) * ethPrice
    }))
  } catch (error) {
    console.error('❌ Error fetching companies with ETH values:', error)
    throw error
  }
}
