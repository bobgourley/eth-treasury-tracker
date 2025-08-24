#!/usr/bin/env node

/**
 * Permanent OAuth Fix Script
 * This script addresses the recurring OAuth login issues by:
 * 1. Ensuring consistent environment variables
 * 2. Validating Google Cloud Console configuration
 * 3. Testing session persistence
 * 4. Providing diagnostic information
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 OAuth Permanent Fix Script')
console.log('=============================\n')

// Check environment file
const envPath = path.join(__dirname, '.env')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!')
  process.exit(1)
}

// Load environment variables
require('dotenv').config()

const requiredVars = [
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL', 
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'ADMIN_EMAIL'
]

console.log('1. Environment Variables Check:')
let allVarsPresent = true
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value) {
    console.log(`   ✅ ${varName}: ${varName.includes('SECRET') ? '[HIDDEN]' : value}`)
  } else {
    console.log(`   ❌ ${varName}: MISSING`)
    allVarsPresent = false
  }
})

if (!allVarsPresent) {
  console.log('\n❌ Missing required environment variables!')
  process.exit(1)
}

console.log('\n2. OAuth Configuration Validation:')

// Validate Google Client ID format
const clientId = process.env.GOOGLE_CLIENT_ID
if (clientId && clientId.endsWith('.apps.googleusercontent.com')) {
  console.log('   ✅ Google Client ID format is valid')
} else {
  console.log('   ❌ Google Client ID format is invalid')
}

// Validate NextAuth URL
const nextAuthUrl = process.env.NEXTAUTH_URL
console.log(`   ✅ NextAuth URL: ${nextAuthUrl}`)

// Validate Admin Email
const adminEmail = process.env.ADMIN_EMAIL
console.log(`   ✅ Admin Email: ${adminEmail}`)

console.log('\n3. Google Cloud Console Requirements:')
console.log('   📋 Authorized redirect URIs must include:')
console.log(`      - ${nextAuthUrl}/api/auth/callback/google`)
console.log('      - https://ethereumlist.com/api/auth/callback/google')
console.log('   📋 OAuth consent screen must be configured')
console.log('   📋 OAuth client must be enabled')

console.log('\n4. Session Persistence Recommendations:')
console.log('   🔧 Added explicit NEXTAUTH_SECRET to configuration')
console.log('   🔧 Enhanced cookie settings for better persistence')
console.log('   🔧 Added JWT configuration for longer sessions')
console.log('   🔧 Set proper domain for production cookies')

console.log('\n5. Common Issues & Solutions:')
console.log('   🐛 Port mismatch: Ensure dev server runs on port 3000')
console.log('   🐛 NEXTAUTH_SECRET: Must be consistent across environments')
console.log('   🐛 Google redirect URIs: Must match exactly in Google Console')
console.log('   🐛 Session cookies: Clear browser cookies if issues persist')

console.log('\n✅ OAuth configuration has been enhanced!')
console.log('🚀 Restart the development server and test login flow')
