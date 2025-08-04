import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Real Ethereum treasury companies data (updated with accurate holdings)
  const companies = [
    {
      name: 'BitMine Immersion Technologies',
      ticker: 'BMNR',
      ethHoldings: 566776.0, // Announced holdings - acquires and stakes ETH as primary reserve
      ethAddresses: JSON.stringify([]), // Empty - using manual admin updates for MVP
      marketCap: "1600000000", // Estimated market cap
      sharesOutstanding: "45000000",
      ethPerShare: 0.0126,
      mnavRatio: 1.35,
      stakingYield: 4.8,
      yieldSources: 'ETH staking rewards, validator operations',
      capitalStructure: 'Acquires and stakes ETH as a primary reserve asset, aiming to build the world\'s largest public ETH treasury',
      fundingSources: 'Strategic ETH accumulation, staking infrastructure',
    },
    {
      name: 'SharpLink Gaming',
      ticker: 'SBET',
      ethHoldings: 360807.0, // Announced holdings - focuses on accumulating and staking Ethereum
      ethAddresses: JSON.stringify([]), // Empty - using manual admin updates for MVP
      marketCap: "1330000000", // Estimated market cap
      sharesOutstanding: "152000",
      ethPerShare: 2.37,
      mnavRatio: 1.15,
      stakingYield: 5.2,
      yieldSources: 'ETH staking rewards, DeFi protocols',
      capitalStructure: 'Focuses on accumulating and staking Ethereum as its core treasury reserve, supporting decentralized gaming and finance solutions',
      fundingSources: 'Gaming revenue, strategic ETH accumulation',
    },
    {
      name: 'Bit Digital, Inc',
      ticker: 'BTBT',
      ethHoldings: 120306.0, // Announced holdings - operates as digital asset company
      ethAddresses: JSON.stringify([]), // Empty - using manual admin updates for MVP
      marketCap: "444000000", // Estimated market cap
      sharesOutstanding: "85000000",
      ethPerShare: 0.00142,
      mnavRatio: 1.25,
      stakingYield: 4.5,
      yieldSources: 'ETH staking, validator operations',
      capitalStructure: 'Operates as a digital asset company centered on Ethereum staking and infrastructure',
      fundingSources: 'Digital asset operations, ETH staking infrastructure',
    },
    {
      name: 'BTCS Inc.',
      ticker: 'BTCS',
      ethHoldings: 55788.0, // Announced holdings - blockchain infrastructure with ETH strategy
      ethAddresses: JSON.stringify([]), // Empty - using manual admin updates for MVP
      marketCap: "200000000", // Estimated market cap
      sharesOutstanding: "28000000",
      ethPerShare: 0.00199,
      mnavRatio: 1.18,
      stakingYield: 4.2,
      yieldSources: 'ETH staking, network participation yield',
      capitalStructure: 'Provides blockchain infrastructure with a core strategy of holding and staking ETH for network participation and yield',
      fundingSources: 'Blockchain infrastructure services, ETH staking',
    },
    {
      name: 'GameSquare Holdings',
      ticker: 'GAME',
      ethHoldings: 10170.0, // Announced holdings - pivots to Ethereum-based digital asset treasury
      ethAddresses: JSON.stringify([]), // Empty - using manual admin updates for MVP
      marketCap: "50000000", // Estimated market cap
      sharesOutstanding: "15000000",
      ethPerShare: 0.000678,
      mnavRatio: 1.05,
      stakingYield: 3.5,
      yieldSources: 'NFT yields, gaming partnerships',
      capitalStructure: 'Pivots media and entertainment activities to build an Ethereum-based digital asset treasury and explore NFT yields',
      fundingSources: 'Media and entertainment operations, digital asset strategy',
    },
    {
      name: 'Intchains Group Limited',
      ticker: 'ICG',
      ethHoldings: 7023.0, // Announced holdings - designs blockchain hardware
      ethAddresses: JSON.stringify([]), // Empty - using manual admin updates for MVP
      marketCap: "75000000", // Estimated market cap
      sharesOutstanding: "20000000",
      ethPerShare: 0.000351,
      mnavRatio: 1.08,
      stakingYield: 3.8,
      yieldSources: 'ETH staking, Web3 infrastructure',
      capitalStructure: 'Designs blockchain hardware and holds ETH as a strategic long-term store of value for its Web3 initiatives',
      fundingSources: 'Blockchain hardware sales, Web3 development',
    },
    {
      name: 'KR1 plc',
      ticker: 'KR1',
      ethHoldings: 5500.0, // Announced holdings - invests in and accumulates ETH
      ethAddresses: JSON.stringify([]), // Empty - using manual admin updates for MVP
      marketCap: "45000000", // Estimated market cap
      sharesOutstanding: "12000000",
      ethPerShare: 0.000458,
      mnavRatio: 1.12,
      stakingYield: 4.0,
      yieldSources: 'ETH staking, crypto asset investments',
      capitalStructure: 'Invests in and accumulates ETH and other crypto assets as a primary treasury and growth strategy',
      fundingSources: 'Crypto investments, ETH accumulation strategy',
    },
    {
      name: 'Exodus Movement',
      ticker: 'EXOD',
      ethHoldings: 2550.0, // Announced holdings - crypto wallet platform
      ethAddresses: JSON.stringify([]), // Empty - using manual admin updates for MVP
      marketCap: "120000000", // Estimated market cap
      sharesOutstanding: "75000000",
      ethPerShare: 0.000034,
      mnavRatio: 0.98,
      stakingYield: 3.2,
      yieldSources: 'Platform fees, ETH treasury growth',
      capitalStructure: 'Operates a crypto wallet platform and holds ETH directly on its balance sheet to drive treasury growth and product innovation',
      fundingSources: 'Wallet platform revenue, product innovation',
    },
    {
      name: 'BTC Digital Ltd',
      ticker: 'BTCT',
      ethHoldings: 2100.0, // Announced holdings - focuses on acquiring and holding ETH
      ethAddresses: JSON.stringify([]), // Empty - using manual admin updates for MVP
      marketCap: "35000000", // Estimated market cap
      sharesOutstanding: "18000000",
      ethPerShare: 0.000117,
      mnavRatio: 1.02,
      stakingYield: 3.6,
      yieldSources: 'ETH appreciation, network yield',
      capitalStructure: 'Focuses its business around acquiring and holding ETH for long-term appreciation and network yield',
      fundingSources: 'Digital asset operations, ETH acquisition strategy',
    },
  ]

  // Clear existing companies and create new ones
  await prisma.company.deleteMany({})
  await prisma.company.createMany({
    data: companies,
  })



  // Calculate and store system metrics
  const totalEth = companies.reduce((sum, company) => sum + company.ethHoldings, 0)
  const ethPrice = 3680.0 // Current ETH price in USD (approximate)
  const totalEthValue = totalEth * ethPrice
  const totalMarketCap = companies.reduce((sum, company) => sum + Number(company.marketCap), 0)
  const totalEthSupply = 120500000 // Approximate total ETH supply
  const ethSupplyPercent = (totalEth / totalEthSupply) * 100
  
  // Clear existing metrics and create new ones with enhanced data
  await prisma.systemMetrics.deleteMany({})
  await prisma.systemMetrics.create({
    data: {
      totalEthHoldings: totalEth,
      totalCompanies: companies.length,
      ethPrice: ethPrice,
      totalEthValue: totalEthValue,
      totalMarketCap: totalMarketCap,
      ethSupplyPercent: ethSupplyPercent,
    },
  })

  console.log('🌱 Database seeded successfully!')
  console.log(`Created ${companies.length} companies`)
  console.log('System metrics calculated and stored')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
