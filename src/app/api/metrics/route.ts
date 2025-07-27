import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Use EXACT same query pattern as companies API to ensure consistency
    const companies = await prisma.company.findMany({
      orderBy: { ethHoldings: 'desc' }
    })

    // Ensure we have the expected number of companies
    if (companies.length !== 9) {
      console.error(`CRITICAL: Expected 9 companies, got ${companies.length}`);
      console.error('Companies found:', companies.map(c => `${c.ticker} (${c.name})`));
    }

    // Try to get system metrics, but don't fail if table doesn't exist
    let systemMetrics = null
    try {
      // Only query fields that exist in production database
      systemMetrics = await prisma.systemMetrics.findFirst({
        select: {
          ethPrice: true,
          lastUpdate: true
        }
      })
    } catch (systemMetricsError) {
      console.log('SystemMetrics table error (non-critical):', systemMetricsError)
      // Continue without system metrics
    }

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
    companies.forEach((c, i) => {
      console.log(`  ${i+1}. ID:${c.id} ${c.ticker} (${c.name}) - ETH: ${c.ethHoldings || 0}, Active: ${c.isActive}, MarketCap: ${c.marketCap}`)
    })

    const validCompanies = companies
    console.log(`\nValid companies count (should be 9): ${validCompanies.length}`)
    console.log(`Valid companies === companies: ${validCompanies === companies}`)

    const companiesWithEth = validCompanies.filter(c => (c.ethHoldings ?? 0) > 0)
    console.log(`Companies with ETH holdings > 0: ${companiesWithEth.length}`)

    console.log('\nCompanies contributing to totals:')
    validCompanies.forEach((c, i) => {
      const ethValue = (c.ethHoldings || 0)
      const marketCap = c.marketCap ? BigInt(c.marketCap.toString()) : BigInt(0)
      console.log(`  ${i+1}. ${c.ticker}: ETH=${ethValue}, MarketCap=${marketCap.toString()}`)
    })
    
    console.log(`\nFinal metrics calculation inputs:`)
    console.log(`- validCompanies.length: ${validCompanies.length}`)
    console.log(`- This will be returned as totalCompanies: ${validCompanies.length}`)
    console.log('================================\n')

    // Calculate totals using ALL companies
    const totalEthHeld = validCompanies.reduce((sum, company) => sum + (company.ethHoldings ?? 0), 0)
    const totalMarketCap = validCompanies.reduce((sum, company) => {
      const marketCap = company.marketCap ? BigInt(company.marketCap.toString()) : BigInt(0)
      return sum + marketCap
    }, BigInt(0))

    // Get ETH price (use last known value from database, only hardcode if no database value exists)
    const ethPrice = systemMetrics?.ethPrice || 3680.0
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
      lastUpdate: systemMetrics?.lastUpdate || new Date(),
      // TEMPORARY DEBUG: Include raw company data to diagnose count issue
      debugCompanies: validCompanies.map(c => ({
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
    
    // Try to get last known ETH price before falling back to hardcoded value
    let fallbackEthPrice = 3680.0 // Only used if absolutely no database access
    try {
      const lastMetrics = await prisma.systemMetrics.findFirst({
        select: {
          ethPrice: true
        }
      })
      if (lastMetrics?.ethPrice) {
        fallbackEthPrice = lastMetrics.ethPrice
        console.log('Using last known ETH price from database:', fallbackEthPrice)
      }
    } catch (dbError) {
      console.log('Could not access database for last known ETH price, using hardcoded fallback')
    }
    
    // Static fallback metrics for MVP (updated July 2025)
    const fallbackMetrics = {
      totalEthHoldings: 1130020.0, // Sum of all 9 companies: 566776 + 360807 + 120306 + 55788 + 10170 + 7023 + 5500 + 2550 + 2100
      totalEthValue: 1130020.0 * fallbackEthPrice, // ETH value at last known price
      totalMarketCap: '2899000000', // Sum of all 9 company market caps
      ethPrice: fallbackEthPrice,
      ethSupplyPercent: (1130020.0 / 120500000.0) * 100, // ~0.938%
      totalEthSupply: 120500000.0,
      totalCompanies: 9,
      lastUpdate: new Date(),
    }
    
    return NextResponse.json(fallbackMetrics)
  }
}
// Force redeploy Sun Jul 27 00:27:33 EDT 2025 - Comprehensive debugging for company count issue
