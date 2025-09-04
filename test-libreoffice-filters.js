const { exec } = require('child_process');

console.log('Testing LibreOffice filters...');

// Test LibreOffice version
exec('libreoffice --version', (error, stdout, stderr) => {
  if (error) {
    console.log('LibreOffice version error:', error.message);
  } else {
    console.log('LibreOffice version:', stdout.trim());
  }
});

// Test available filters
exec('libreoffice --headless --infilter="?"', (error, stdout, stderr) => {
  if (error) {
    console.log('Filter check error:', error.message);
  } else {
    console.log('Available input filters:', stdout);
  }
});

// Test export filters
exec('libreoffice --headless --outfilter="?"', (error, stdout, stderr) => {
  if (error) {
    console.log('Export filter check error:', error.message);
  } else {
    console.log('Available export filters:', stdout);
  }
});

// Test specific conversion
exec('libreoffice --headless --convert-to docx test.pdf --outdir .', (error, stdout, stderr) => {
  if (error) {
    console.log('Conversion test error:', error.message);
    console.log('stderr:', stderr);
  } else {
    console.log('Conversion test stdout:', stdout);
  }
});
