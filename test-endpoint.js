const fetch = require('node-fetch');

async function testEndpoint() {
  const LIBREE_URL = 'https://libre-vljo.onrender.com';
  
  console.log('Testing PDF to Word endpoint accessibility...');
  
  try {
    // Test OPTIONS request to the endpoint
    console.log('1. Testing OPTIONS request...');
    const optionsResponse = await fetch(`${LIBREE_URL}/convert-pdf-to-word`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://novenutility123.netlify.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('OPTIONS response status:', optionsResponse.status);
    console.log('OPTIONS response headers:', Object.fromEntries(optionsResponse.headers.entries()));
    
    // Test POST request without file (should return 400)
    console.log('2. Testing POST request without file...');
    const postResponse = await fetch(`${LIBREE_URL}/convert-pdf-to-word`, {
      method: 'POST',
      headers: {
        'Origin': 'https://novenutility123.netlify.app',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    console.log('POST response status:', postResponse.status);
    console.log('POST response headers:', Object.fromEntries(postResponse.headers.entries()));
    
    if (postResponse.ok) {
      const data = await postResponse.text();
      console.log('POST response body:', data);
    } else {
      const errorText = await postResponse.text();
      console.log('Error response:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testEndpoint();
