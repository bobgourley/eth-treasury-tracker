/**
 * Clear ALL SEC filings data from database
 * This will delete all existing SEC filings records
 */

const { PrismaClient } = require('@prisma/client')

async function clearAllSecFilings() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🗑️ Clearing ALL SEC filings data from database...')
    
    // Delete all SEC filings records
    const deleteResult = await prisma.secFiling.deleteMany({})
    
    console.log(`✅ Deleted ${deleteResult.count} SEC filing records`)
    console.log('🧹 Database is now clean and ready for fresh data')
    
  } catch (error) {
    console.error('❌ Error clearing SEC filings:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearAllSecFilings()
