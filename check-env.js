// Quick environment check for OAuth configuration
require('dotenv').config();

console.log('=== OAuth Environment Check ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET (length: ' + process.env.GOOGLE_CLIENT_ID.length + ')' : 'NOT SET');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET (length: ' + process.env.GOOGLE_CLIENT_SECRET.length + ')' : 'NOT SET');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET (length: ' + process.env.NEXTAUTH_SECRET.length + ')' : 'NOT SET');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || 'NOT SET');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
