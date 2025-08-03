#!/usr/bin/env node

/**
 * Scheduled job to update system metrics with live API data
 * 
 * This script can be run:
 * 1. Manually: node scripts/update-live-data.js
 * 2. Via cron job: */15 * * * * /path/to/node /path/to/scripts/update-live-data.js
 * 3. Via Vercel cron (if deployed): https://vercel.com/docs/cron-jobs
 * 4. Via GitHub Actions workflow
 */

const { updateSystemMetrics } = require('../src/lib/dataFetcher')

async function main() {
  console.log('🚀 Starting scheduled live data update...')
  console.log('⏰ Timestamp:', new Date().toISOString())
  
  try {
    await updateSystemMetrics()
    console.log('✅ Live data update completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Live data update failed:', error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️ Received SIGINT, shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n⚠️ Received SIGTERM, shutting down gracefully...')
  process.exit(0)
})

// Run the update
main().catch((error) => {
  console.error('❌ Unhandled error in live data update:', error)
  process.exit(1)
})
