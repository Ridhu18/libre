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

// Convert DOCX to PDF
app.post('/convert/docx-to-pdf', upload.single('file'), async (req, res) => {
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
      const outputFile = inputFile.replace('.pdf', '.docx');
      const quality = req.body.quality || 'standard';

      console.log('File received:', req.file.originalname, 'Size:', req.file.size);
      console.log('Input file:', inputFile);
      console.log('Output file:', outputFile);
      console.log('Conversion quality:', quality);

      // Try primary conversion method with simpler options
      const libreOfficeCmd = `libreoffice --headless --convert-to docx --outdir "${path.dirname(outputFile)}" "${inputFile}"`;
      console.log('Executing command:', libreOfficeCmd);

      exec(libreOfficeCmd, { timeout: 120000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('Conversion failed:', error);
          console.error('stderr:', stderr);
          console.error('stdout:', stdout);
          
          // Clean up input file
          try {
            fs.unlinkSync(inputFile);
          } catch (cleanupError) {
            console.error('Input file cleanup error:', cleanupError);
          }
          
          if (error.code === 'ETIMEDOUT') {
            return res.status(408).json({ 
              success: false,
              error: 'Conversion timed out. PDF may be too complex or large.',
              suggestion: 'Try with a simpler PDF'
            });
          }
          
          return res.status(500).json({ 
            success: false,
            error: 'Conversion failed', 
            details: error.message,
            suggestion: 'Try with a different PDF or check if the PDF is corrupted'
          });
        }

        console.log('Conversion completed successfully');
        console.log('stdout:', stdout);
        if (stderr) console.log('stderr:', stderr);

        // Check if output file exists
        if (fs.existsSync(outputFile)) {
          // Validate the output file
          const stats = fs.statSync(outputFile);
          console.log('Output file size:', stats.size);
          
          if (stats.size === 0) {
            console.log('Output file is empty');
            // Clean up files
            try {
              fs.unlinkSync(inputFile);
              fs.unlinkSync(outputFile);
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
          res.download(outputFile, path.basename(outputFile), (err) => {
            if (err) {
              console.error('Download error:', err);
            }
            // Clean up files after download
            try {
              fs.unlinkSync(inputFile);
              fs.unlinkSync(outputFile);
              console.log('Files cleaned up successfully');
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError);
            }
          });
        } else {
          console.log('Output file not found:', outputFile);
          // Clean up input file
          try {
            fs.unlinkSync(inputFile);
          } catch (cleanupError) {
            console.error('Input file cleanup error:', cleanupError);
          }
          
          res.status(500).json({ 
            success: false,
            error: 'Output file not generated',
            suggestion: 'PDF may be corrupted or LibreOffice conversion failed'
          });
        }
      });
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
