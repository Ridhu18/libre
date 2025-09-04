const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

async function testFileUpload() {
  const LIBREE_URL = 'https://libre-vljo.onrender.com';
  
  console.log('Testing file upload...');
  
  try {
    // Create a simple test file
    const testFilePath = './test.txt';
    fs.writeFileSync(testFilePath, 'This is a test file');
    console.log('Created test file');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath), 'test.txt');
    
    console.log('Sending file upload request...');
    
    const response = await fetch(`${LIBREE_URL}/convert-pdf-to-word`, {
      method: 'POST',
      body: formData,
      headers: {
        'Origin': 'https://novenutility123.netlify.app'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.text();
      console.log('Response body:', data);
    } else {
      const errorText = await response.text();
      console.log('Error response:', errorText);
    }
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testFileUpload();
