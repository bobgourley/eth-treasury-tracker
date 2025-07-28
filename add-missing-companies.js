const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addMissingCompanies() {
  try {
    console.log('Adding missing companies...')

    // Check current company count
    const currentCompanies = await prisma.company.findMany()
    console.log(`Current companies: ${currentCompanies.length}`)

    // Add Intchains Group Limited
    const intchains = await prisma.company.create({
      data: {
        name: 'Intchains Group Limited',
        ticker: 'ICG',
        ethHoldings: 7023.0,
        marketCap: BigInt(75000000),
        sharesOutstanding: BigInt(20000000),
        ethPerShare: 0.000351,
        mnavRatio: 1.08,
        stakingYield: 3.8,
        yieldSources: 'ETH staking, Web3 infrastructure',
        capitalStructure: 'Designs blockchain hardware and holds ETH as a strategic long-term store of value for its Web3 initiatives',
        fundingSources: 'Blockchain hardware sales, Web3 development',
        stockPrice: 3.75,
        website: 'https://intchains.com',
        isActive: true
      }
    })
    console.log('✅ Added Intchains Group Limited')

    // Add BTC Digital Ltd
    const btcDigital = await prisma.company.create({
      data: {
        name: 'BTC Digital Ltd',
        ticker: 'BTCT',
        ethHoldings: 2100.0,
        marketCap: BigInt(35000000),
        sharesOutstanding: BigInt(18000000),
        ethPerShare: 0.000117,
        mnavRatio: 1.02,
        stakingYield: 3.6,
        yieldSources: 'ETH appreciation, network yield',
        capitalStructure: 'Focuses its business around acquiring and holding ETH for long-term appreciation and network yield',
        fundingSources: 'Digital asset operations, ETH acquisition strategy',
        stockPrice: 1.94,
        website: 'https://btcdigital.com',
        isActive: true
      }
    })
    console.log('✅ Added BTC Digital Ltd')

    // Verify final count
    const finalCompanies = await prisma.company.findMany()
    console.log(`Final companies: ${finalCompanies.length}`)

    console.log('🎉 Successfully added missing companies!')

  } catch (error) {
    console.error('Error adding companies:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addMissingCompanies()
