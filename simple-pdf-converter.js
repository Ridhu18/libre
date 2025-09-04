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
        service: 'simple-pdf-converter', 
        timestamp: new Date().toISOString(),
        libreoffice: 'NOT_AVAILABLE',
        error: error.message
      });
    } else {
      res.json({ 
        status: 'OK', 
        service: 'simple-pdf-converter', 
        timestamp: new Date().toISOString(),
        libreoffice: 'AVAILABLE',
        version: stdout.trim()
      });
    }
  });
});

// Simple PDF to Word conversion
app.post('/convert-pdf-to-word', upload.single('file'), (req, res) => {
  console.log('PDF to Word conversion request received');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputFile = req.file.path;
  const inputDir = path.dirname(inputFile);
  const outputFile = path.join(inputDir, 'output.docx');
  
  console.log('Input file:', inputFile);
  console.log('Output file:', outputFile);

  // Simple LibreOffice conversion
  const command = `libreoffice --headless --convert-to docx "${inputFile}" --outdir "${inputDir}"`;
  
  exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
    console.log('Command executed:', command);
    console.log('Error:', error);
    console.log('stdout:', stdout);
    console.log('stderr:', stderr);
    
    if (error) {
      console.error('Conversion failed:', error);
      return res.status(500).json({ 
        error: 'Conversion failed',
        details: error.message
      });
    }
    
    // Check if output file was created
    if (fs.existsSync(outputFile)) {
      console.log('Conversion successful, file size:', fs.statSync(outputFile).size);
      
      // Send the file
      res.download(outputFile, 'converted.docx', (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // Clean up
        try {
          fs.unlinkSync(inputFile);
          fs.unlinkSync(outputFile);
        } catch (cleanupError) {
          console.error('Cleanup error:', cleanupError);
        }
      });
    } else {
      console.log('Output file not found');
      return res.status(500).json({ 
        error: 'Output file not generated',
        details: 'LibreOffice conversion completed but output file not found'
      });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Simple PDF converter running on port ${PORT}`);
});
