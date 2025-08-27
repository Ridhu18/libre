const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec, execFile } = require('child_process');
const fs = require('fs');
const os = require('os');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: 'https://novenutility123.netlify.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json());
app.use(express.static('public'));

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
  // Check if LibreOffice is available
  exec('libreoffice --version', (error, stdout, stderr) => {
    if (error) {
      console.error('LibreOffice not available:', error);
      res.json({ 
        status: 'WARNING', 
        service: 'libree-pdf-converter', 
        timestamp: new Date().toISOString(),
        libreoffice: 'NOT_AVAILABLE',
        error: error.message
      });
    } else {
      console.log('LibreOffice version:', stdout.trim());
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
      'Primary conversion method: LibreOffice DOCX',
      'Fallback method: LibreOffice DOCX with MS Word 2007 XML filter',
      'Clean temporary file handling',
      'Automatic output file detection',
      'Comprehensive error handling'
    ]
  });
});

// Convert DOCX to PDF
app.post('/convert-docx-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputFile = req.file.path;
    const outputFile = inputFile.replace('.docx', '.pdf');

    // Use LibreOffice to convert DOCX to PDF
    exec(`libreoffice --headless --convert-to pdf "${inputFile}" --outdir "${path.dirname(outputFile)}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({ error: 'Conversion failed', details: error.message });
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
app.post('/convert-xlsx-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputFile = req.file.path;
    const outputFile = inputFile.replace('.xlsx', '.pdf');

    // Use LibreOffice to convert XLSX to PDF
    exec(`libreoffice --headless --convert-to pdf "${inputFile}" --outdir "${path.dirname(outputFile)}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({ error: 'Conversion failed', details: error.message });
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
app.post('/convert-pptx-to-pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputFile = req.file.path;
    const outputFile = inputFile.replace('.pptx', '.pdf');

    // Use LibreOffice to convert PPTX to PDF
    exec(`libreoffice --headless --convert-to pdf "${inputFile}" --outdir "${path.dirname(outputFile)}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({ error: 'Conversion failed', details: error.message });
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

// Enhanced PDF to Word conversion with multiple fallback methods
app.post('/convert-pdf-to-word', upload.single('file'), async (req, res) => {
  try {
    console.log('PDF to Word conversion request received');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if LibreOffice is available
    exec('libreoffice --version', (libreOfficeError) => {
      if (libreOfficeError) {
        console.error('LibreOffice not available:', libreOfficeError);
        return res.status(500).json({ 
          success: false,
          error: 'LibreOffice is not available on this server',
          details: libreOfficeError.message,
          suggestion: 'Please contact support or try again later'
        });
      }
      
      // Continue with conversion if LibreOffice is available
      const inputFile = req.file.path;
      const inputDir = path.dirname(inputFile);
      const inputBasename = path.basename(req.file.originalname, path.extname(req.file.originalname));
      const outputFile = path.join(inputDir, `${inputBasename}.docx`);
      const quality = req.body.quality || 'standard';
      
      // Verify input file is a PDF
      const inputExt = path.extname(req.file.originalname).toLowerCase();
      if (inputExt !== '.pdf') {
        console.error('Invalid file type:', inputExt);
        return res.status(400).json({ 
          success: false,
          error: 'Invalid file type',
          details: `Expected PDF file, got ${inputExt}`,
          suggestion: 'Please upload a PDF file'
        });
      }
      
      // Additional PDF validation by checking file header
      try {
        const fileBuffer = fs.readFileSync(inputFile, { start: 0, end: 4 });
        const fileHeader = fileBuffer.toString('hex');
        if (!fileHeader.startsWith('25504446')) { // PDF magic bytes: %PDF
          console.error('File does not have valid PDF header:', fileHeader);
          return res.status(400).json({ 
            success: false,
            error: 'Invalid PDF file',
            details: 'File does not contain valid PDF content',
            suggestion: 'Please upload a valid PDF file'
          });
        }
        console.log('PDF header validation passed:', fileHeader);
      } catch (headerError) {
        console.error('Error reading file header:', headerError);
        return res.status(500).json({ 
          success: false,
          error: 'File validation failed',
          details: 'Could not read file content for validation',
          suggestion: 'Please try uploading the file again'
        });
      }

      console.log('File received:', req.file.originalname, 'Size:', req.file.size);
      console.log('Input file:', inputFile);
      console.log('Output file:', outputFile);
      console.log('Conversion quality:', quality);

      // Verify input file exists and is readable
      if (!fs.existsSync(inputFile)) {
        console.error('Input file does not exist:', inputFile);
        return res.status(500).json({ 
          success: false,
          error: 'Input file not found',
          suggestion: 'Please try uploading the file again'
        });
      }
      
      // Verify output directory is writable
      try {
        const testFile = path.join(inputDir, '.test-write');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('Output directory is writable:', inputDir);
      } catch (writeError) {
        console.error('Output directory is not writable:', inputDir, writeError);
        return res.status(500).json({ 
          success: false,
          error: 'Server configuration error',
          details: 'Output directory is not writable',
          suggestion: 'Please contact support'
        });
      }

      // Create a clean temporary file to avoid path issues
      const cleanInputFile = path.join(inputDir, `input_${Date.now()}.pdf`);
      try {
        fs.copyFileSync(inputFile, cleanInputFile);
        console.log('Created clean input file:', cleanInputFile);
        
        // Try primary conversion method
        const libreOfficeArgs = [
          '--headless',
          '--convert-to', 'docx',
          '--outdir', inputDir,
          cleanInputFile
        ];
        console.log('Executing command with args:', libreOfficeArgs);
        
        execFile('libreoffice', libreOfficeArgs, { timeout: 120000 }, (error, stdout, stderr) => {
          if (error) {
            console.error('Primary conversion failed:', error);
            console.error('stderr:', stderr);
            console.error('stdout:', stdout);
            
            // Try alternative method
            console.log('Trying alternative conversion method...');
            const altArgs = [
              '--headless',
              '--convert-to', 'docx:MS Word 2007 XML',
              '--outdir', inputDir,
              cleanInputFile
            ];
            
            execFile('libreoffice', altArgs, { timeout: 120000 }, (altError, altStdout, altStderr) => {
              if (altError) {
                console.error('Alternative conversion also failed:', altError);
                
                // Clean up files
                try {
                  fs.unlinkSync(inputFile);
                  fs.unlinkSync(cleanInputFile);
                } catch (cleanupError) {
                  console.error('File cleanup error:', cleanupError);
                }
                
                return res.status(500).json({ 
                  success: false,
                  error: 'All conversion methods failed', 
                  details: 'LibreOffice could not process this PDF file',
                  suggestion: 'The PDF may be corrupted or contain unsupported content'
                });
              }
              
              console.log('Alternative conversion succeeded');
              processConversionResult(altStdout, altStderr);
            });
            
            return;
          }

          console.log('Primary conversion completed successfully');
          console.log('stdout:', stdout);
          if (stderr) console.log('stderr:', stderr);

          processConversionResult(stdout, stderr);
        });
        
      } catch (copyError) {
        console.error('Error creating clean input file:', copyError);
        return res.status(500).json({ 
          success: false,
          error: 'File preparation failed',
          details: copyError.message,
          suggestion: 'Please try again'
        });
      }
      
      // Helper function to process the conversion result
      function processConversionResult(stdout, stderr) {
        // Check if output file exists
        let actualOutputFile = outputFile;
        
        // Try to find any .docx file in the output directory
        if (!fs.existsSync(actualOutputFile)) {
          try {
            const files = fs.readdirSync(inputDir);
            const docxFile = files.find(file => file.endsWith('.docx'));
            if (docxFile) {
              actualOutputFile = path.join(inputDir, docxFile);
              console.log('Found output file:', actualOutputFile);
            }
          } catch (dirError) {
            console.error('Error reading output directory:', dirError);
          }
        }
        
        if (fs.existsSync(actualOutputFile)) {
          // Validate the output file
          const stats = fs.statSync(actualOutputFile);
          console.log('Output file size:', stats.size);
          
          if (stats.size === 0) {
            console.log('Output file is empty');
            // Clean up files
            try {
              fs.unlinkSync(inputFile);
              fs.unlinkSync(cleanInputFile);
              fs.unlinkSync(actualOutputFile);
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError);
            }
            return res.status(500).json({ 
              success: false,
              error: 'Conversion failed - output file is empty',
              suggestion: 'PDF may be corrupted or contain unsupported content'
            });
          }

          console.log('Sending file for download');
          // Send the DOCX file
          res.download(actualOutputFile, path.basename(actualOutputFile), (err) => {
            if (err) {
              console.error('Download error:', err);
            }
            // Clean up files after download
            try {
              fs.unlinkSync(inputFile);
              fs.unlinkSync(cleanInputFile);
              fs.unlinkSync(actualOutputFile);
              console.log('Files cleaned up successfully');
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError);
            }
          });
        } else {
          console.log('Output file not found');
          // Clean up files
          try {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(cleanInputFile);
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }
          
          res.status(500).json({ 
            success: false,
            error: 'Output file not generated',
            suggestion: 'PDF may be corrupted or LibreOffice conversion failed'
          });
        }
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
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
