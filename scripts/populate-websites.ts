import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const companyWebsites = [
  {
    name: "BitMine Immersion Technologies",
    ticker: "BMNR",
    website: "https://bitminetech.io"
  },
  {
    name: "SharpLink Gaming",
    ticker: "SBET", 
    website: "https://www.sharplink.com"
  },
  {
    name: "Bit Digital, Inc",
    ticker: "BTBT",
    website: "https://bit-digital.com"
  },
  {
    name: "BTCS Inc.",
    ticker: "BTCS",
    website: "https://www.btcs.com"
  },
  {
    name: "GameSquare Holdings",
    ticker: "GAME",
    website: "https://www.gamesquare.com"
  },
  {
    name: "Intchains Group Limited",
    ticker: "ICG",
    website: "https://www.intchains.com"
  },
  {
    name: "KR1 plc",
    ticker: "KR1:AQSE",
    website: "https://kr1.io"
  },
  {
    name: "Exodus Movement",
    ticker: "EXOD",
    website: "https://www.exodus.com"
  },
  {
    name: "BTC Digital Ltd",
    ticker: "BTCT",
    website: "https://btct.investorroom.com"
  }
]

async function populateWebsites() {
  console.log('Starting to populate company websites...')
  
  for (const companyData of companyWebsites) {
    try {
      // Find company by ticker since it's more unique
      const company = await prisma.company.findFirst({
        where: {
          ticker: companyData.ticker
        }
      })
      
      if (company) {
        await prisma.company.update({
          where: { id: company.id },
          data: { website: companyData.website }
        })
        console.log(`✅ Updated ${companyData.name} (${companyData.ticker}) with website: ${companyData.website}`)
      } else {
        console.log(`❌ Company not found: ${companyData.name} (${companyData.ticker})`)
      }
    } catch (error) {
      console.error(`❌ Error updating ${companyData.name}:`, error)
    }
  }
  
  console.log('✅ Finished populating company websites!')
}

async function main() {
  try {
    await populateWebsites()
  } catch (error) {
    console.error('❌ Script failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
