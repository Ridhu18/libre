const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function testAlternativeConversion() {
  console.log('Testing alternative PDF to Word conversion...');
  
  // Create a simple test PDF file
  const testPdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Hello World) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000204 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
297
%%EOF`;

  const testPdfPath = 'test-alt.pdf';
  fs.writeFileSync(testPdfPath, testPdfContent);
  console.log('Created test PDF file');

  try {
    // Create form data
    const FormData = require('form-data');
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testPdfPath));

    console.log('Sending request to alternative conversion endpoint...');
    
    const response = await fetch('https://libre-vljo.onrender.com/convert-pdf-to-word-alt', {
      method: 'POST',
      body: formData,
      headers: {
        ...formData.getHeaders(),
        'Accept': 'application/octet-stream, application/json'
      }
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    if (!response.ok) {
      const errorData = await response.json();
      console.log('Error response:', errorData);
      return;
    }

    // Check if response is a file download
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/octet-stream')) {
      const buffer = await response.buffer();
      const outputPath = 'converted-alt.docx';
      fs.writeFileSync(outputPath, buffer);
      console.log('Conversion successful! File saved as:', outputPath);
      console.log('File size:', buffer.length, 'bytes');
    } else {
      const text = await response.text();
      console.log('Response text:', text);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testPdfPath)) {
      fs.unlinkSync(testPdfPath);
    }
  }
}

testAlternativeConversion();
