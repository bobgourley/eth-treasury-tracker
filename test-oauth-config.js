// Test OAuth configuration
require('dotenv').config();

console.log('=== OAuth Configuration Test ===');

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const nextAuthUrl = process.env.NEXTAUTH_URL;
const adminEmail = process.env.ADMIN_EMAIL;
const nextAuthSecret = process.env.NEXTAUTH_SECRET;

console.log('\n📋 Environment Variables:');
console.log('GOOGLE_CLIENT_ID:', clientId ? `${clientId.substring(0, 20)}...` : '❌ MISSING');
console.log('GOOGLE_CLIENT_SECRET:', clientSecret ? `${clientSecret.substring(0, 8)}...` : '❌ MISSING');
console.log('NEXTAUTH_URL:', nextAuthUrl || '❌ MISSING');
console.log('ADMIN_EMAIL:', adminEmail || '❌ MISSING');
console.log('NEXTAUTH_SECRET:', nextAuthSecret ? 'SET' : '❌ MISSING');

console.log('\n🔍 Validation:');
console.log('Client ID format:', clientId?.endsWith('.apps.googleusercontent.com') ? '✅' : '❌');
console.log('Client Secret length:', clientSecret?.length >= 20 ? '✅' : '❌');
console.log('NextAuth URL set:', nextAuthUrl ? '✅' : '❌');
console.log('Admin email set:', adminEmail ? '✅' : '❌');

console.log('\n🚀 Next Steps:');
console.log('1. Visit http://localhost:3000/admin/login');
console.log('2. Click "Sign in with Google"');
console.log('3. Check browser console for errors');
console.log('4. Check terminal for NextAuth debug logs');
