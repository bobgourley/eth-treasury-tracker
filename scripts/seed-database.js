const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Company data to seed
const companies = [
  {
    name: 'BitMine Immersion Technologies',
    ticker: 'BMNR',
    ethHoldings: 566776.0,
    marketCap: 2800000000n,
    sharesOutstanding: 95000000n,
    ethPerShare: 0.00597,
    mnavRatio: 1.45,
    stakingYield: 5.2,
    yieldSources: 'ETH staking, immersion cooling operations',
    capitalStructure: 'Operates immersion cooling infrastructure and maintains a strategic ETH treasury for long-term value creation',
    fundingSources: 'Immersion cooling services, ETH treasury strategy',
    stockPrice: 52.30,
    website: 'https://bitmineimmersion.com',
    isActive: true,
  },
  {
    name: 'SharpLink Gaming',
    ticker: 'SBET',
    ethHoldings: 360000.0,
    marketCap: 1650000000n,
    sharesOutstanding: 42000000n,
    ethPerShare: 0.00857,
    mnavRatio: 1.38,
    stakingYield: 4.8,
    yieldSources: 'ETH staking, gaming platform yields',
    capitalStructure: 'Combines online gaming operations with a substantial ETH treasury strategy to drive shareholder value',
    fundingSources: 'Gaming platform revenue, ETH treasury growth',
    stockPrice: 38.75,
    website: 'https://sharplink.com',
    isActive: true,
  },
  {
    name: 'Bit Digital',
    ticker: 'BTBT',
    ethHoldings: 125000.0,
    marketCap: 520000000n,
    sharesOutstanding: 85000000n,
    ethPerShare: 0.00147,
    mnavRatio: 1.28,
    stakingYield: 4.5,
    yieldSources: 'ETH staking, validator operations',
    capitalStructure: 'Operates as a digital asset company centered on Ethereum staking and infrastructure',
    fundingSources: 'Digital asset operations, ETH staking infrastructure',
    stockPrice: 15.20,
    website: 'https://bitdigital.com',
    isActive: true,
  },
  {
    name: 'BTCS Inc.',
    ticker: 'BTCS',
    ethHoldings: 58000.0,
    marketCap: 220000000n,
    sharesOutstanding: 28000000n,
    ethPerShare: 0.00207,
    mnavRatio: 1.20,
    stakingYield: 4.2,
    yieldSources: 'ETH staking, network participation yield',
    capitalStructure: 'Provides blockchain infrastructure with a core strategy of holding and staking ETH for network participation and yield',
    fundingSources: 'Blockchain infrastructure services, ETH staking',
    stockPrice: 8.45,
    website: 'https://btcs.com',
    isActive: true,
  },
  {
    name: 'GameSquare Holdings',
    ticker: 'GAME',
    ethHoldings: 12500.0,
    marketCap: 65000000n,
    sharesOutstanding: 15000000n,
    ethPerShare: 0.000833,
    mnavRatio: 1.08,
    stakingYield: 3.5,
    yieldSources: 'NFT yields, gaming partnerships',
    capitalStructure: 'Pivots media and entertainment activities to build an Ethereum-based digital asset treasury and explore NFT yields',
    fundingSources: 'Media and entertainment operations, digital asset strategy',
    stockPrice: 4.25,
    website: 'https://gamesquare.com',
    isActive: true,
  },
  {
    name: 'KR1 plc',
    ticker: 'KR1',
    ethHoldings: 6200.0,
    marketCap: 52000000n,
    sharesOutstanding: 12000000n,
    ethPerShare: 0.000517,
    mnavRatio: 1.15,
    stakingYield: 4.0,
    yieldSources: 'ETH staking, crypto asset investments',
    capitalStructure: 'Invests in and accumulates ETH and other crypto assets as a primary treasury and growth strategy',
    fundingSources: 'Crypto investments, ETH accumulation strategy',
    stockPrice: 4.33,
    website: 'https://kr1.io',
    isActive: true,
  },
  {
    name: 'Exodus Movement',
    ticker: 'EXOD',
    ethHoldings: 2800.0,
    marketCap: 135000000n,
    sharesOutstanding: 75000000n,
    ethPerShare: 0.000037,
    mnavRatio: 1.02,
    stakingYield: 3.2,
    yieldSources: 'Platform fees, ETH treasury growth',
    capitalStructure: 'Operates a crypto wallet platform and holds ETH directly on its balance sheet to drive treasury growth and product innovation',
    fundingSources: 'Wallet platform revenue, product innovation',
    stockPrice: 1.80,
    website: 'https://exodus.com',
    isActive: true,
  },
  {
    name: 'Hive Blockchain Technologies',
    ticker: 'HIVE',
    ethHoldings: 1850.0,
    marketCap: 98000000n,
    sharesOutstanding: 62000000n,
    ethPerShare: 0.000030,
    mnavRatio: 1.05,
    stakingYield: 3.8,
    yieldSources: 'ETH mining, staking operations',
    capitalStructure: 'Blockchain infrastructure company with strategic ETH holdings for network participation and treasury diversification',
    fundingSources: 'Mining operations, blockchain infrastructure',
    stockPrice: 1.58,
    website: 'https://hiveblockchain.com',
    isActive: true,
  },
  {
    name: 'Argo Blockchain',
    ticker: 'ARBK',
    ethHoldings: 950.0,
    marketCap: 45000000n,
    sharesOutstanding: 35000000n,
    ethPerShare: 0.000027,
    mnavRatio: 1.03,
    stakingYield: 3.5,
    yieldSources: 'ETH staking, mining pool yields',
    capitalStructure: 'Sustainable blockchain infrastructure with a focus on ETH accumulation and green mining operations',
    fundingSources: 'Sustainable mining operations, ETH treasury',
    stockPrice: 1.29,
    website: 'https://argoblockchain.com',
    isActive: true,
  }
]

// ETF data to seed
const etfs = [
  {
    symbol: 'ETHA',
    name: 'iShares Ethereum Trust ETF',
    ethHoldings: 2730000,
    aum: 10490000000,
    expenseRatio: 0.25,
    nav: 27.58,
    isActive: true,
  },
  {
    symbol: 'ETHE',
    name: 'Grayscale Ethereum Trust',
    ethHoldings: 1108000,
    aum: 4260000000,
    expenseRatio: 2.5,
    nav: 30.15,
    isActive: true,
  },
  {
    symbol: 'ETH',
    name: 'Grayscale Ethereum Mini Trust',
    ethHoldings: 642000,
    aum: 2470000000,
    expenseRatio: 0.25,
    nav: 34.32,
    isActive: true,
  },
  {
    symbol: 'FETH',
    name: 'Fidelity Ethereum Fund',
    ethHoldings: 598000,
    aum: 2300000000,
    expenseRatio: 0.25,
    nav: 36.42,
    isActive: true,
  },
  {
    symbol: 'ETHW',
    name: 'Bitwise Ethereum ETF',
    ethHoldings: 132000,
    aum: 507130000,
    expenseRatio: 0.25,
    nav: 26.13,
    isActive: true,
  },
  {
    symbol: 'ETHV',
    name: 'VanEck Ethereum ETF',
    ethHoldings: 55200,
    aum: 212340000,
    expenseRatio: 0.75,
    nav: 53.35,
    isActive: true,
  },
  {
    symbol: 'EZET',
    name: 'Franklin Ethereum ETF',
    ethHoldings: 19600,
    aum: 75290000,
    expenseRatio: 0.30,
    nav: 27.68,
    isActive: true,
  },
  {
    symbol: 'CETH',
    name: '21Shares Core Ethereum ETF',
    ethHoldings: 11500,
    aum: 44290000,
    expenseRatio: 0.20,
    nav: 18.20,
    isActive: true,
  },
  {
    symbol: 'QETH',
    name: 'Invesco Galaxy Ethereum ETF',
    ethHoldings: 9900,
    aum: 38150000,
    expenseRatio: 0.40,
    nav: 36.34,
    isActive: true,
  }
]

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Clear existing data
    await prisma.company.deleteMany()
    await prisma.etf.deleteMany()
    await prisma.systemMetrics.deleteMany()
    await prisma.ecosystemSummary.deleteMany()
    console.log('🧹 Cleared existing data')

    // Seed companies
    console.log('📊 Seeding companies...')
    for (const company of companies) {
      await prisma.company.create({
        data: company
      })
    }
    console.log(`✅ Created ${companies.length} companies`)

    // Seed ETFs
    console.log('📈 Seeding ETFs...')
    const ethPrice = 3825.95 // Current ETH price
    for (const etf of etfs) {
      await prisma.etf.create({
        data: {
          ...etf,
          totalValue: etf.ethHoldings * ethPrice
        }
      })
    }
    console.log(`✅ Created ${etfs.length} ETFs`)

    // Calculate and seed ecosystem summary
    console.log('🌍 Calculating ecosystem summary...')
    const totalCompanyEth = companies.reduce((sum, c) => sum + c.ethHoldings, 0)
    const totalEtfEth = etfs.reduce((sum, e) => sum + e.ethHoldings, 0)
    const ethSupply = 120500000 // Current ETH supply
    const totalTrackedEth = totalCompanyEth + totalEtfEth
    
    await prisma.ecosystemSummary.create({
      data: {
        ethPrice,
        ethSupply,
        totalTrackedEth,
        totalTrackedPercentage: (totalTrackedEth / ethSupply) * 100,
        companyCount: companies.length,
        companyTotalEth: totalCompanyEth,
        companyTotalValue: totalCompanyEth * ethPrice,
        companyPercentage: (totalCompanyEth / ethSupply) * 100,
        etfCount: etfs.length,
        etfTotalEth: totalEtfEth,
        etfTotalValue: totalEtfEth * ethPrice,
        etfPercentage: (totalEtfEth / ethSupply) * 100,
      }
    })
    console.log('✅ Created ecosystem summary')

    // Create system metrics
    await prisma.systemMetrics.create({
      data: {
        totalEthHoldings: totalCompanyEth,
        totalCompanies: companies.length,
        ethPrice,
        totalEthValue: totalCompanyEth * ethPrice,
        totalMarketCap: companies.reduce((sum, c) => sum + Number(c.marketCap), 0),
        ethSupplyPercent: (totalCompanyEth / ethSupply) * 100,
      }
    })
    console.log('✅ Created system metrics')

    console.log('🎉 Database seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - ${companies.length} companies`)
    console.log(`   - ${etfs.length} ETFs`)
    console.log(`   - ${totalTrackedEth.toLocaleString()} ETH tracked`)
    console.log(`   - ${((totalTrackedEth / ethSupply) * 100).toFixed(3)}% of ETH supply`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error)
      process.exit(1)
    })
}

module.exports = { seedDatabase }
