const { exec } = require('child_process');

console.log('Testing LibreOffice availability...');

// Test LibreOffice version
exec('libreoffice --version', (error, stdout, stderr) => {
  if (error) {
    console.error('❌ LibreOffice not available:', error.message);
    console.error('stderr:', stderr);
  } else {
    console.log('✅ LibreOffice available:', stdout.trim());
  }
});

// Test if we can create directories
const fs = require('fs');
const os = require('os');
const path = require('path');

const testDir = path.join(os.tmpdir(), 'test-libreoffice');
try {
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log('✅ Can create directories in temp folder');
  } else {
    console.log('✅ Temp directory already exists');
  }
  
  // Test file operations
  const testFile = path.join(testDir, 'test.txt');
  fs.writeFileSync(testFile, 'test content');
  console.log('✅ Can write files');
  
  fs.unlinkSync(testFile);
  console.log('✅ Can delete files');
  
} catch (error) {
  console.error('❌ File operations failed:', error.message);
}

console.log('Test completed.');
