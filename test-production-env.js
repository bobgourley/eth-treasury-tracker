// Test production environment variables via API
async function testProductionEnv() {
  console.log('=== Production Environment Test ===\n');
  
  try {
    // Test if we can trigger OAuth and see what happens
    console.log('1. Testing OAuth initiation...');
    const response = await fetch('https://ethereumlist.com/api/auth/signin/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        callbackUrl: 'https://ethereumlist.com/admin'
      })
    });
    
    console.log('OAuth initiation response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('OAuth response:', data);
    } else {
      console.log('OAuth initiation failed');
      const errorText = await response.text();
      console.log('Error response:', errorText.substring(0, 200));
    }
    
  } catch (error) {
    console.log('❌ OAuth test failed:', error.message);
  }
  
  console.log('\n2. Common Vercel Environment Issues:');
  console.log('- NEXTAUTH_URL must be exactly: https://ethereumlist.com');
  console.log('- NEXTAUTH_SECRET must be set and non-empty');
  console.log('- GOOGLE_CLIENT_ID must match Google Console');
  console.log('- GOOGLE_CLIENT_SECRET must match Google Console');
  console.log('- Environment variables must be deployed (not just saved)');
  
  console.log('\n3. Next Debug Steps:');
  console.log('a) Check Vercel dashboard → Settings → Environment Variables');
  console.log('b) Verify all variables are set for "Production" environment');
  console.log('c) Redeploy after any environment variable changes');
  console.log('d) Check Vercel function logs during login attempt');
}

testProductionEnv();
