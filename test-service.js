import fetch from 'node-fetch';

async function testLibreeService() {
  const LIBREE_URL = 'https://libre-vljo.onrender.com';
  
  console.log('Testing libree service...');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${LIBREE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('Health response:', healthData);
    
    // Test LibreOffice availability
    console.log('2. Testing LibreOffice availability...');
    const libreOfficeResponse = await fetch(`${LIBREE_URL}/test-libreoffice`);
    const libreOfficeData = await libreOfficeResponse.json();
    console.log('LibreOffice response:', libreOfficeData);
    
    // Test PDF conversion endpoint (without file)
    console.log('3. Testing PDF conversion endpoint...');
    const pdfConversionResponse = await fetch(`${LIBREE_URL}/test-pdf-conversion`);
    const pdfConversionData = await pdfConversionResponse.json();
    console.log('PDF conversion response:', pdfConversionData);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testLibreeService();
