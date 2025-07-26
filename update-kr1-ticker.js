const { PrismaClient } = require('@prisma/client')

async function updateKR1Ticker() {
  const prisma = new PrismaClient()
  
  try {
    const result = await prisma.company.updateMany({
      where: {
        name: 'KR1 plc'
      },
      data: {
        ticker: 'KR1:AQSE'
      }
    })
    
    console.log(`Updated ${result.count} company record(s)`)
    
    // Verify the update
    const updatedCompany = await prisma.company.findFirst({
      where: { name: 'KR1 plc' },
      select: { name: true, ticker: true }
    })
    
    console.log('Updated company:', updatedCompany)
    
  } catch (error) {
    console.error('Error updating ticker:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateKR1Ticker()
