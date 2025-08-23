// Check the actual redirect URL from Google OAuth
const axios = require('axios');

async function checkRedirect() {
  try {
    const response = await axios.get('http://localhost:3000/api/auth/signin/google', {
      maxRedirects: 0,
      validateStatus: () => true
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Location:', response.headers.location);
    
    if (response.headers.location) {
      const url = new URL(response.headers.location);
      console.log('\nRedirect URL Analysis:');
      console.log('Host:', url.host);
      console.log('Pathname:', url.pathname);
      console.log('Search params:', url.searchParams.toString());
      console.log('Contains Google OAuth:', url.host.includes('google.com'));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkRedirect();
