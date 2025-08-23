// Debug production OAuth issues
const https = require('https');

async function debugProductionOAuth() {
  console.log('=== Production OAuth Debug ===\n');
  
  try {
    // Test NextAuth configuration endpoint
    console.log('1. Testing NextAuth configuration...');
    const configResponse = await fetch('https://ethereumlist.com/api/auth/providers');
    if (configResponse.ok) {
      const providers = await configResponse.json();
      console.log('✅ NextAuth providers endpoint accessible');
      console.log('Available providers:', Object.keys(providers));
    } else {
      console.log('❌ NextAuth providers endpoint failed:', configResponse.status);
    }
  } catch (error) {
    console.log('❌ NextAuth providers test failed:', error.message);
  }

  try {
    // Test session endpoint
    console.log('\n2. Testing session endpoint...');
    const sessionResponse = await fetch('https://ethereumlist.com/api/auth/session');
    if (sessionResponse.ok) {
      const session = await sessionResponse.json();
      console.log('✅ Session endpoint accessible');
      console.log('Current session:', session.user ? 'Authenticated' : 'Not authenticated');
    } else {
      console.log('❌ Session endpoint failed:', sessionResponse.status);
    }
  } catch (error) {
    console.log('❌ Session test failed:', error.message);
  }

  console.log('\n3. Required Google Cloud Console Settings:');
  console.log('Authorized redirect URIs must include:');
  console.log('- https://ethereumlist.com/api/auth/callback/google');
  console.log('\nAuthorized JavaScript origins must include:');
  console.log('- https://ethereumlist.com');
  
  console.log('\n4. Required Vercel Environment Variables:');
  console.log('- NEXTAUTH_URL=https://ethereumlist.com');
  console.log('- NEXTAUTH_SECRET=[32+ character secret]');
  console.log('- GOOGLE_CLIENT_ID=[your client ID]');
  console.log('- GOOGLE_CLIENT_SECRET=[your client secret]');
  console.log('- ADMIN_EMAIL=bob@bobgourley.com');
  
  console.log('\n5. Debug Steps:');
  console.log('a) Visit https://ethereumlist.com/admin/login');
  console.log('b) Open browser DevTools (F12)');
  console.log('c) Click "Sign in with Google"');
  console.log('d) Check Console tab for JavaScript errors');
  console.log('e) Check Network tab for failed requests');
}

debugProductionOAuth();
