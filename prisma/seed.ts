import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })

  // Real Ethereum treasury companies data
  const companies = [
    {
      name: 'SharpLink Gaming',
      ticker: 'SBET',
      ethHoldings: 360807.0,
      ethAddresses: JSON.stringify(['0x1a2b...c3d4']),
      marketCap: BigInt(1330000000), // ~$1.33B approx value
      sharesOutstanding: BigInt(152000), // Estimated for ~2.37 ETH per 1K diluted shares
      ethPerShare: 2.37,
      mnavRatio: 2.8, // Significant market premium
      stakingYield: 4.2,
      yieldSources: 'Nearly all ETH staked, validator rewards',
      capitalStructure: 'High ETH concentration strategy',
      fundingSources: 'Gaming operations, strategic ETH accumulation',
    },
    {
      name: 'BitMine Immersion Technologies',
      ticker: 'BMNR',
      ethHoldings: 433716.5, // Mid-point of 300,657 to 566,776 range
      ethAddresses: JSON.stringify(['0x5e6f...7g8h', '0x9i0j...k1l2']),
      marketCap: BigInt(1600000000), // Mid-point of $1.1-2.1B range
      sharesOutstanding: BigInt(45000000),
      ethPerShare: 0.0096,
      mnavRatio: 1.95,
      stakingYield: 4.8,
      yieldSources: 'Most ETH staked, aggressive acquisition strategy',
      capitalStructure: 'Debt-financed ETH acquisitions',
      fundingSources: 'Aims to hold 5% of total ETH supply',
    },
    {
      name: 'Coinbase Global, Inc',
      ticker: 'COIN',
      ethHoldings: 137300.0,
      ethAddresses: JSON.stringify(['0xm3n4...o5p6', '0xq7r8...s9t0']),
      marketCap: BigInt(500000000), // ~$500M approx value
      sharesOutstanding: BigInt(250000000),
      ethPerShare: 0.00055,
      mnavRatio: 0.85,
      stakingYield: 3.1,
      yieldSources: 'ETH used in operations, staking infrastructure',
      capitalStructure: 'Operational reserves and treasury',
      fundingSources: 'Exchange operations, supports staking and DeFi',
    },
    {
      name: 'Bit Digital, Inc',
      ticker: 'BTBT',
      ethHoldings: 120306.0,
      ethAddresses: JSON.stringify(['0xu1v2...w3x4']),
      marketCap: BigInt(444000000), // ~$444M approx value
      sharesOutstanding: BigInt(85000000),
      ethPerShare: 0.00142,
      mnavRatio: 1.25,
      stakingYield: 4.5,
      yieldSources: 'Actively staking ETH, validator operations',
      capitalStructure: 'Transitioned from Bitcoin to Ethereum focus',
      fundingSources: 'Mining operations, strategic pivot to ETH',
    },
    {
      name: 'BTCS Inc.',
      ticker: 'BTCS',
      ethHoldings: 55788.0,
      ethAddresses: JSON.stringify(['0xy5z6...a7b8']),
      marketCap: BigInt(200000000), // ~$200M approx value
      sharesOutstanding: BigInt(28000000),
      ethPerShare: 0.00199,
      mnavRatio: 1.15,
      stakingYield: 4.0,
      yieldSources: 'Treasury holdings support validator operations',
      capitalStructure: 'ETH staking focused treasury',
      fundingSources: 'Validator operations, staking rewards',
    },
    {
      name: 'GameSquare Holdings',
      ticker: 'GAME',
      ethHoldings: 10170.0,
      ethAddresses: JSON.stringify(['0xc9d0...e1f2']),
      marketCap: BigInt(50000000), // Estimated
      sharesOutstanding: BigInt(15000000),
      ethPerShare: 0.000678,
      mnavRatio: 0.95,
      stakingYield: 3.8,
      yieldSources: 'ETH treasury and NFT yield strategies',
      capitalStructure: 'Gaming and NFT focused treasury',
      fundingSources: 'Gaming operations, NFT marketplace activities',
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

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
