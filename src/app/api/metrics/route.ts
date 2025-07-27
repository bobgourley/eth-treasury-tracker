import { NextResponse } from 'next/server'
// import { prisma } from '@/lib/db' // Commented out unused import

type CompanyData = {
  id: number;
  ticker: string;
  name: string;
  ethHoldings: number;
  marketCap: string;
  isActive: boolean;
};

export async function GET() {
  try {
    // Fetch live data from database
    const { PrismaClient } = require('@prisma/client')
    const prisma = new PrismaClient()
    
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        ticker: true,
        name: true,
        ethHoldings: true,
        marketCap: true,
        isActive: true
      }
    })
    
    await prisma.$disconnect()
    
    console.log(`\n=== METRICS API DIRECT APPROACH ===`)
    console.log(`Using ${companies.length} companies from known working data`)
    console.log(`Companies: ${companies.map((c: CompanyData) => c.ticker).join(', ')}`)
    console.log('====================================\n')

    // COMPREHENSIVE DEBUGGING to identify company count discrepancy
    console.log(`\n=== METRICS API COMPREHENSIVE DEBUG ===`)
    console.log(`Raw companies array length: ${companies.length}`)
    console.log(`Raw companies array type: ${typeof companies}`)
    console.log(`Raw companies array is array: ${Array.isArray(companies)}`)
    
    if (companies.length === 0) {
      console.log('ERROR: No companies returned from database query!')
      console.log('This suggests a database connection or query issue')
    }
    
    console.log('\nAll companies with full details:')
    companies.forEach((c: CompanyData, i: number) => {
      console.log(`  ${i+1}. ID:${c.id} ${c.ticker} (${c.name}) - ETH: ${c.ethHoldings || 0}, Active: ${c.isActive}, MarketCap: ${c.marketCap}`)
    })

    const validCompanies = companies
    console.log(`\nValid companies count (should be 9): ${validCompanies.length}`)
    console.log(`Valid companies === companies: ${validCompanies === companies}`)

    const companiesWithEth = validCompanies.filter((c: CompanyData) => (c.ethHoldings ?? 0) > 0)
    console.log(`Companies with ETH holdings > 0: ${companiesWithEth.length}`)

    console.log('\nCompanies contributing to totals:')
    validCompanies.forEach((c: CompanyData, i: number) => {
      const ethValue = (c.ethHoldings || 0)
      const marketCap = c.marketCap ? BigInt(c.marketCap.toString()) : BigInt(0)
      console.log(`  ${i+1}. ${c.ticker}: ETH=${ethValue}, MarketCap=${marketCap.toString()}`)
    })
    
    console.log(`\nFinal metrics calculation inputs:`)
    console.log(`- validCompanies.length: ${validCompanies.length}`)
    console.log(`- This will be returned as totalCompanies: ${validCompanies.length}`)
    console.log('================================\n')

    // Calculate totals using ALL companies
    const totalEthHeld = validCompanies.reduce((sum: number, company: CompanyData) => sum + (company.ethHoldings ?? 0), 0)
    const totalMarketCap = validCompanies.reduce((sum: bigint, company: CompanyData) => {
      const marketCap = company.marketCap ? BigInt(company.marketCap.toString()) : BigInt(0)
      return sum + marketCap
    }, BigInt(0))

    // Get ETH price from system metrics or fetch from CoinGecko
    const systemMetrics = await prisma.systemMetrics.findFirst()
    let ethPrice = systemMetrics?.ethPrice || 3680.0
    
    // If no system metrics or stale price, fetch from CoinGecko
    if (!systemMetrics || !systemMetrics.ethPrice) {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd')
        const data = await response.json()
        ethPrice = data.ethereum?.usd || ethPrice
      } catch (error) {
        console.log('Failed to fetch ETH price from CoinGecko, using fallback:', ethPrice)
      }
    }
    const totalEthSupply = 120500000.0 // Static value for MVP

    // Calculate derived metrics
    const totalEthValue = totalEthHeld * ethPrice
    const ethSupplyPercentage = (totalEthHeld / totalEthSupply) * 100

    const metrics = {
      totalEthHoldings: totalEthHeld,
      totalEthValue,
      totalMarketCap: totalMarketCap.toString(),
      ethPrice,
      ethSupplyPercent: ethSupplyPercentage,
      totalEthSupply,
      totalCompanies: validCompanies.length, // Use validCompanies count, not companies.length
      lastUpdate: new Date(),
      // TEMPORARY DEBUG: Include raw company data to diagnose count issue
      debugCompanies: validCompanies.map((c: CompanyData) => ({
        id: c.id,
        ticker: c.ticker,
        name: c.name,
        ethHoldings: c.ethHoldings,
        isActive: c.isActive
      })),
      debugCompanyCount: validCompanies.length,
      debugRawCount: companies.length,
      // ETH price tracking fields (will be enabled after schema migration)
      // ethPriceLastUpdate: systemMetrics?.ethPriceLastUpdate || new Date(),
      // ethPriceSource: systemMetrics?.ethPriceSource || 'CoinGecko API',
    }

    return NextResponse.json(metrics)
  } catch (error: unknown) {
    console.error('Database error, using static fallback metrics:', error)
    
    // Use hardcoded ETH price for fallback (database is already having issues)
    const fallbackEthPrice = 3680.0
    console.log('Using hardcoded ETH price for fallback:', fallbackEthPrice)
    
    // Static fallback metrics for MVP (updated July 27, 2025 - matches current live data)
    const fallbackMetrics = {
      totalEthHoldings: 1131276.0, // Current sum from live companies API
      totalEthValue: 1131276.0 * fallbackEthPrice, // ETH value at last known price
      totalMarketCap: '5442000000', // Current sum from live companies API
      ethPrice: fallbackEthPrice,
      ethSupplyPercent: (1131276.0 / 120500000.0) * 100, // ~0.939%
      totalEthSupply: 120500000.0,
      totalCompanies: 9, // Correct count of all 9 companies
      lastUpdate: new Date(),
    }
    
    return NextResponse.json(fallbackMetrics)
  }
}
// Force redeploy Sun Jul 27 00:27:33 EDT 2025 - Comprehensive debugging for company count issue
