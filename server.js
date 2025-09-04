const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: [
    'https://novenutility123.netlify.app',
    'https://novenutility.netlify.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://libre-vljo.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'Content-Length'],
  exposedHeaders: ['Content-Disposition', 'Content-Type', 'Content-Length']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(os.tmpdir(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Health check endpoint
app.get('/health', (req, res) => {
  exec('libreoffice --version', (error, stdout, stderr) => {
    if (error) {
      res.json({ 
        status: 'WARNING', 
        service: 'libree-pdf-converter', 
        timestamp: new Date().toISOString(),
        libreoffice: 'NOT_AVAILABLE',
        error: error.message
      });
    } else {
      res.json({ 
        status: 'OK', 
        service: 'libree-pdf-converter', 
        timestamp: new Date().toISOString(),
        libreoffice: 'AVAILABLE',
        version: stdout.trim()
      });
    }
  });
});

// Test LibreOffice endpoint
app.get('/test-libreoffice', (req, res) => {
  exec('libreoffice --version', (error, stdout, stderr) => {
    if (error) {
      res.json({ 
        success: false,
        error: 'LibreOffice not available',
        details: error.message,
        command: 'libreoffice --version'
      });
    } else {
      res.json({ 
        success: true,
        version: stdout.trim(),
        command: 'libreoffice --version'
      });
    }
  });
});

// Test PDF to Word conversion endpoint
app.get('/test-pdf-conversion', (req, res) => {
  res.json({
    success: true,
    message: 'PDF to Word conversion service is running',
    features: [
      'Simple LibreOffice conversion',
      'Clean temporary file handling',
      'Comprehensive error handling'
    ]
  });
});

// Simple test endpoint for CORS debugging
app.post('/test-cors', (req, res) => {
  console.log('CORS test request received');
  console.log('Request headers:', req.headers);
  console.log('Request origin:', req.headers.origin);
  res.json({
    success: true,
    message: 'CORS test successful',
    origin: req.headers.origin,
    method: req.method
  });
});

// Convert DOCX to PDF
app.post('/convert-docx-to-pdf', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputFile = req.file.path;
    const outputFile = inputFile.replace('.docx', '.pdf');
    
    console.log('Converting DOCX to PDF:', inputFile, '->', outputFile);

    exec(`libreoffice --headless --convert-to pdf "${inputFile}" --outdir "${path.dirname(outputFile)}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({ error: 'Conversion failed' });
      }

      // Check if output file exists
      if (fs.existsSync(outputFile)) {
        // Send the PDF file
        res.download(outputFile, path.basename(outputFile), (err) => {
          // Clean up files after download
          try {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        });
      } else {
        res.status(500).json({ error: 'Output file not generated' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Convert XLSX to PDF
app.post('/convert-xlsx-to-pdf', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputFile = req.file.path;
    const outputFile = inputFile.replace('.xlsx', '.pdf');
    
    console.log('Converting XLSX to PDF:', inputFile, '->', outputFile);

    exec(`libreoffice --headless --convert-to pdf "${inputFile}" --outdir "${path.dirname(outputFile)}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({ error: 'Conversion failed' });
      }

      // Check if output file exists
      if (fs.existsSync(outputFile)) {
        // Send the PDF file
        res.download(outputFile, path.basename(outputFile), (err) => {
          // Clean up files after download
          try {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        });
      } else {
        res.status(500).json({ error: 'Output file not generated' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Convert PPTX to PDF
app.post('/convert-pptx-to-pdf', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputFile = req.file.path;
    const outputFile = inputFile.replace('.pptx', '.pdf');
    
    console.log('Converting PPTX to PDF:', inputFile, '->', outputFile);

    exec(`libreoffice --headless --convert-to pdf "${inputFile}" --outdir "${path.dirname(outputFile)}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({ error: 'Conversion failed' });
      }

      // Check if output file exists
      if (fs.existsSync(outputFile)) {
        // Send the PDF file
        res.download(outputFile, path.basename(outputFile), (err) => {
          // Clean up files after download
          try {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        });
      } else {
        res.status(500).json({ error: 'Output file not generated' });
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Simple PDF to Word conversion
app.post('/convert-pdf-to-word', upload.single('file'), (req, res) => {
  console.log('PDF to Word conversion request received');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputFile = req.file.path;
  const inputDir = path.dirname(inputFile);
  const inputBasename = path.basename(req.file.originalname, path.extname(req.file.originalname));
  
  console.log('Input file:', inputFile);
  console.log('Input directory:', inputDir);
  console.log('Input basename:', inputBasename);

  // Try different LibreOffice conversion commands
  const commands = [
    `libreoffice --headless --convert-to docx "${inputFile}" --outdir "${inputDir}"`,
    `libreoffice --headless --convert-to "MS Word 2007 XML" "${inputFile}" --outdir "${inputDir}"`,
    `libreoffice --headless --convert-to "writer_pdf_import" "${inputFile}" --outdir "${inputDir}"`
  ];
  
  let commandIndex = 0;
  
  function tryConversion() {
    if (commandIndex >= commands.length) {
      return res.status(500).json({ 
        error: 'All conversion methods failed',
        details: 'LibreOffice could not convert the PDF file'
      });
    }
    
    const command = commands[commandIndex];
    console.log(`Trying command ${commandIndex + 1}:`, command);
  
  exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
    console.log('Command executed:', command);
    console.log('Error:', error);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    
    if (error) {
      console.error(`Command ${commandIndex + 1} failed:`, error);
      commandIndex++;
      return tryConversion();
    }
    
    // Look for the output file - LibreOffice creates it with the same name but .docx extension
    const expectedOutputFile = path.join(inputDir, `${inputBasename}.docx`);
    console.log('Expected output file:', expectedOutputFile);
    
    // Check if output file was created
    if (fs.existsSync(expectedOutputFile)) {
      console.log('Conversion successful, file size:', fs.statSync(expectedOutputFile).size);
      
      // Send the file
      res.download(expectedOutputFile, `${inputBasename}.docx`, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Clean up
        try {
          fs.unlinkSync(inputFile);
          fs.unlinkSync(expectedOutputFile);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      });
    } else {
      console.log('Output file not found at:', expectedOutputFile);
      
      // Try to find any .docx file in the directory
      try {
        const files = fs.readdirSync(inputDir);
        console.log('Files in directory:', files);
        const docxFiles = files.filter(file => file.endsWith('.docx'));
        console.log('DOCX files found:', docxFiles);
        
        if (docxFiles.length > 0) {
          const foundOutputFile = path.join(inputDir, docxFiles[0]);
          console.log('Found DOCX file:', foundOutputFile);
          
          res.download(foundOutputFile, `${inputBasename}.docx`, (err) => {
            if (err) {
              console.error('Download error:', err);
            }
            // Clean up
            try {
              fs.unlinkSync(inputFile);
              fs.unlinkSync(foundOutputFile);
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError);
            }
          });
        } else {
          // Try next command
          commandIndex++;
          return tryConversion();
        }
      } catch (dirError) {
        console.error('Error reading directory:', dirError);
        // Try next command
        commandIndex++;
        return tryConversion();
      }
    }
  });
  
  // Start with the first command
  tryConversion();
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Libree PDF converter service running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
