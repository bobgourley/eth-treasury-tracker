// Debug the specific OAuth error
const axios = require('axios');

async function debugOAuthError() {
  try {
    console.log('=== Debugging OAuth Error ===');
    
    // Check the login page with error parameter
    const loginWithError = await axios.get('http://localhost:3000/admin/login?error=google');
    console.log('Login page with error loads:', loginWithError.status === 200 ? '✅' : '❌');
    
    // Check if the error is displayed on the page
    const pageContent = loginWithError.data;
    const hasErrorDisplay = pageContent.includes('error') || pageContent.includes('Error') || pageContent.includes('failed');
    console.log('Error message displayed on page:', hasErrorDisplay ? '✅' : '❌');
    
    // Test the OAuth configuration
    console.log('\n=== OAuth Configuration Analysis ===');
    
    // Check environment variables are properly set
    require('dotenv').config();
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    
    console.log('Google Client ID format check:');
    console.log('- Has correct length (72 chars):', clientId?.length === 72 ? '✅' : '❌');
    console.log('- Ends with .apps.googleusercontent.com:', clientId?.endsWith('.apps.googleusercontent.com') ? '✅' : '❌');
    
    console.log('\nGoogle Client Secret format check:');
    console.log('- Has reasonable length (24-48 chars):', clientSecret?.length >= 24 && clientSecret?.length <= 48 ? '✅' : '❌');
    
    console.log('\nNextAuth URL check:');
    console.log('- NextAuth URL:', nextAuthUrl);
    console.log('- Matches current server:', nextAuthUrl === 'http://localhost:3000' ? '✅' : '❌');
    
    console.log('\n=== Common Google Cloud Console Issues ===');
    console.log('1. Authorized redirect URIs must include:');
    console.log('   - http://localhost:3000/api/auth/callback/google');
    console.log('   - https://yourdomain.com/api/auth/callback/google (for production)');
    console.log('\n2. OAuth consent screen must be configured');
    console.log('\n3. OAuth client must be enabled and not suspended');
    console.log('\n4. Scopes should include email and profile');
    
  } catch (error) {
    console.error('Debug error:', error.message);
  }
}

debugOAuthError();
