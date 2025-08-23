// Test OAuth configuration and flow
const axios = require('axios');

async function testOAuthFlow() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('=== Testing OAuth Configuration ===');
    
    // Test 1: Check if providers endpoint works
    console.log('\n1. Testing providers endpoint...');
    const providersResponse = await axios.get(`${baseUrl}/api/auth/providers`);
    console.log('Providers response:', JSON.stringify(providersResponse.data, null, 2));
    
    // Test 2: Check CSRF token
    console.log('\n2. Testing CSRF endpoint...');
    const csrfResponse = await axios.get(`${baseUrl}/api/auth/csrf`);
    console.log('CSRF response:', JSON.stringify(csrfResponse.data, null, 2));
    
    // Test 3: Check session endpoint
    console.log('\n3. Testing session endpoint...');
    const sessionResponse = await axios.get(`${baseUrl}/api/auth/session`);
    console.log('Session response:', JSON.stringify(sessionResponse.data, null, 2));
    
    // Test 4: Check if Google provider is configured
    if (providersResponse.data && providersResponse.data.google) {
      console.log('\n✅ Google OAuth provider is properly configured');
      console.log('Google provider details:', providersResponse.data.google);
    } else {
      console.log('\n❌ Google OAuth provider not found in configuration');
    }
    
  } catch (error) {
    console.error('Error testing OAuth:', error.response?.data || error.message);
  }
}

testOAuthFlow();
