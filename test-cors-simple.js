const fetch = require('node-fetch');

async function testCorsSimple() {
  const LIBREE_URL = 'https://libre-vljo.onrender.com';
  
  console.log('Testing simple CORS endpoint...');
  
  try {
    const response = await fetch(`${LIBREE_URL}/test-cors`, {
      method: 'POST',
      headers: {
        'Origin': 'https://novenutility123.netlify.app',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: true })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      console.log('Request failed with status:', response.status);
    }
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testCorsSimple();
