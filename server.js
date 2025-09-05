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

// Convert XLSX/XLS to PDF
app.post('/convert-xlsx-to-pdf', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputFile = req.file.path;
    const inputBasename = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const outputFile = path.join(path.dirname(inputFile), `${inputBasename}.pdf`);
    
    console.log('Converting Excel to PDF:', inputFile, '->', outputFile);
    console.log('Original filename:', req.file.originalname);
    console.log('File size:', req.file.size, 'bytes');
    console.log('File mimetype:', req.file.mimetype);

    exec(`libreoffice --headless --convert-to pdf "${inputFile}" --outdir "${path.dirname(outputFile)}"`, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion error:', error);
        console.error('stderr:', stderr);
        return res.status(500).json({ error: 'Conversion failed', details: error.message });
      }

      console.log('LibreOffice stdout:', stdout);
      if (stderr) {
        console.log('LibreOffice stderr:', stderr);
      }

      // Check if output file exists
      if (fs.existsSync(outputFile)) {
        console.log('PDF generated successfully:', outputFile);
        // Send the PDF file
        res.download(outputFile, `${inputBasename}.pdf`, (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Clean up files after download
          try {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(outputFile);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        });
      } else {
        console.error('Output file not found:', outputFile);
        // Try to find any PDF file in the directory
        try {
          const files = fs.readdirSync(path.dirname(outputFile));
          console.log('Files in directory:', files);
          const pdfFiles = files.filter(file => file.endsWith('.pdf'));
          console.log('PDF files found:', pdfFiles);
          
          if (pdfFiles.length > 0) {
            const foundPdfFile = path.join(path.dirname(outputFile), pdfFiles[0]);
            console.log('Found PDF file:', foundPdfFile);
            
            res.download(foundPdfFile, `${inputBasename}.pdf`, (err) => {
              if (err) {
                console.error('Download error:', err);
              }
              // Clean up
              try {
                fs.unlinkSync(inputFile);
                fs.unlinkSync(foundPdfFile);
              } catch (cleanupError) {
                console.error('Cleanup error:', cleanupError);
              }
            });
          } else {
            res.status(500).json({ error: 'Output file not generated', details: 'No PDF file found after conversion' });
          }
        } catch (dirError) {
          console.error('Error reading directory:', dirError);
          res.status(500).json({ error: 'Output file not generated', details: 'Could not read output directory' });
        }
      }
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
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

// Alternative PDF to Word conversion using different approach
app.post('/convert-pdf-to-word-alt', upload.single('file'), (req, res) => {
  console.log('Alternative PDF to Word conversion request received');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputFile = req.file.path;
  const inputDir = path.dirname(inputFile);
  const inputBasename = path.basename(req.file.originalname, path.extname(req.file.originalname));
  
  console.log('Input file:', inputFile);
  console.log('Input directory:', inputDir);
  console.log('Input basename:', inputBasename);

  // Try using unoconv if available
  const commands = [
    `unoconv -f docx "${inputFile}"`,
    `unoconv -f doc "${inputFile}"`,
    `unoconv -f rtf "${inputFile}"`,
    `libreoffice --headless --convert-to txt "${inputFile}" --outdir "${inputDir}"`,
    `pdftotext "${inputFile}" "${path.join(inputDir, inputBasename)}.txt"`
  ];
  
  let commandIndex = 0;
  
  function tryConversion() {
    if (commandIndex >= commands.length) {
      return res.status(500).json({ 
        error: 'All alternative conversion methods failed',
        details: 'No suitable conversion tool found for PDF to Word',
        availableFilters: 'Only writer_pdf_Export available'
      });
    }
    
    const command = commands[commandIndex];
    console.log(`Trying alternative command ${commandIndex + 1}:`, command);
  
    exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
      console.log('Command executed:', command);
      console.log('Error:', error);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      
      if (error) {
        console.error(`Alternative command ${commandIndex + 1} failed:`, error);
        commandIndex++;
        return tryConversion();
      }
      
      // Look for output files
      const extensions = ['.docx', '.doc', '.rtf', '.txt'];
      let foundFile = null;
      
      for (const ext of extensions) {
        const expectedOutputFile = path.join(inputDir, `${inputBasename}${ext}`);
        if (fs.existsSync(expectedOutputFile)) {
          foundFile = expectedOutputFile;
          break;
        }
      }
      
      if (foundFile) {
        console.log('Alternative conversion successful, file size:', fs.statSync(foundFile).size);
        
        // Send the file
        res.download(foundFile, `${inputBasename}${path.extname(foundFile)}`, (err) => {
          if (err) {
            console.error('Download error:', err);
          }
          // Clean up
          try {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(foundFile);
          } catch (cleanupError) {
            console.error('Cleanup error:', cleanupError);
          }
        });
      } else {
        console.log('Alternative output file not found');
        
        // Try to find any output file in the directory
        try {
          const files = fs.readdirSync(inputDir);
          console.log('Files in directory:', files);
          const outputFiles = files.filter(file => 
            file.endsWith('.docx') || file.endsWith('.doc') || file.endsWith('.rtf') || file.endsWith('.txt')
          );
          console.log('Output files found:', outputFiles);
          
          if (outputFiles.length > 0) {
            const foundOutputFile = path.join(inputDir, outputFiles[0]);
            console.log('Found output file:', foundOutputFile);
            
            res.download(foundOutputFile, outputFiles[0], (err) => {
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
  }
  
  // Start with the first command
  tryConversion();
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

  // Try multiple LibreOffice conversion methods with enhanced formatting preservation
  const conversionMethods = [
    // Method 1: Enhanced DOCX with best formatting preservation
    `libreoffice --headless --convert-to docx:"Office Open XML Text" "${inputFile}" --outdir "${inputDir}"`,
    // Method 2: MS Word 2007 XML for better compatibility
    `libreoffice --headless --convert-to docx:"MS Word 2007 XML" "${inputFile}" --outdir "${inputDir}"`,
    // Method 3: Standard DOCX format
    `libreoffice --headless --convert-to docx "${inputFile}" --outdir "${inputDir}"`,
    // Method 4: Legacy DOC format
    `libreoffice --headless --convert-to doc "${inputFile}" --outdir "${inputDir}"`,
    // Method 5: RTF format (good for formatting preservation)
    `libreoffice --headless --convert-to rtf "${inputFile}" --outdir "${inputDir}"`,
    // Method 6: Plain text as last resort
    `libreoffice --headless --convert-to txt "${inputFile}" --outdir "${inputDir}"`
  ];
  
  let methodIndex = 0;
  
  function tryConversion() {
    if (methodIndex >= conversionMethods.length) {
      return res.status(500).json({ 
        error: 'PDF to Word conversion failed',
        details: 'All conversion methods failed'
      });
    }
    
    const command = conversionMethods[methodIndex];
    console.log(`Trying conversion method ${methodIndex + 1}:`, command);
    
    exec(command, { timeout: 60000 }, (error, stdout, stderr) => {
      console.log('Command executed:', command);
      console.log('Error:', error);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      
      if (error) {
        console.error(`Conversion method ${methodIndex + 1} failed:`, error);
        methodIndex++;
        return tryConversion();
      }
      
      // Wait a moment for LibreOffice to complete
      setTimeout(() => {
        // Look for output files in different formats
        const outputExtensions = ['.docx', '.doc', '.rtf', '.txt'];
        let foundFile = null;
        let foundExtension = null;
        
        for (const ext of outputExtensions) {
          const outputFile = path.join(inputDir, `${inputBasename}${ext}`);
          if (fs.existsSync(outputFile)) {
            foundFile = outputFile;
            foundExtension = ext;
            break;
          }
        }
        
        if (foundFile) {
          console.log('Conversion successful, file:', foundFile);
          console.log('File size:', fs.statSync(foundFile).size);
          
          // Send the file
          res.download(foundFile, `${inputBasename}${foundExtension}`, (err) => {
            if (err) {
              console.error('Download error:', err);
            }
            // Clean up
            try {
              fs.unlinkSync(inputFile);
              fs.unlinkSync(foundFile);
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError);
            }
          });
        } else {
          console.log('No output file found, trying next method...');
          methodIndex++;
          return tryConversion();
        }
      }, 2000); // Wait 2 seconds for LibreOffice to complete
    });
  }
  
  // Start with the first conversion method
  tryConversion();
});

// Enhanced PDF to Word conversion with image preservation
app.post('/convert-pdf-to-word-enhanced', upload.single('file'), (req, res) => {
  console.log('Enhanced PDF to Word conversion request received');
  
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const inputFile = req.file.path;
  const inputDir = path.dirname(inputFile);
  const inputBasename = path.basename(req.file.originalname, path.extname(req.file.originalname));
  
  console.log('Input file:', inputFile);
  console.log('Input directory:', inputDir);
  console.log('Input basename:', inputBasename);
  console.log('File size:', req.file.size, 'bytes');
  console.log('File mimetype:', req.file.mimetype);

  // Enhanced LibreOffice conversion with specific options for better formatting preservation
  const enhancedCommands = [
    // Method 1: LibreOffice with Writer filter for best formatting
    `libreoffice --headless --convert-to docx:"Office Open XML Text" --infilter="writer_pdf_Import" "${inputFile}" --outdir "${inputDir}"`,
    // Method 2: LibreOffice with Draw filter for image-heavy PDFs
    `libreoffice --headless --convert-to docx:"Office Open XML Text" --infilter="draw_pdf_Import" "${inputFile}" --outdir "${inputDir}"`,
    // Method 3: LibreOffice with Calc filter for table-heavy PDFs
    `libreoffice --headless --convert-to docx:"Office Open XML Text" --infilter="calc_pdf_Import" "${inputFile}" --outdir "${inputDir}"`,
    // Method 4: Standard enhanced conversion
    `libreoffice --headless --convert-to docx:"Office Open XML Text" "${inputFile}" --outdir "${inputDir}"`,
    // Method 5: MS Word 2007 XML format
    `libreoffice --headless --convert-to docx:"MS Word 2007 XML" "${inputFile}" --outdir "${inputDir}"`,
    // Method 6: Standard DOCX
    `libreoffice --headless --convert-to docx "${inputFile}" --outdir "${inputDir}"`
  ];
  
  let commandIndex = 0;
  
  function tryEnhancedConversion() {
    if (commandIndex >= enhancedCommands.length) {
      return res.status(500).json({ 
        error: 'Enhanced PDF to Word conversion failed',
        details: 'All enhanced conversion methods failed'
      });
    }
    
    const command = enhancedCommands[commandIndex];
    console.log(`Trying enhanced conversion method ${commandIndex + 1}:`, command);
    
    exec(command, { timeout: 120000 }, (error, stdout, stderr) => {
      console.log('Enhanced command executed:', command);
      console.log('Error:', error);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
      
      if (error) {
        console.error(`Enhanced conversion method ${commandIndex + 1} failed:`, error);
        commandIndex++;
        return tryEnhancedConversion();
      }
      
      // Wait longer for enhanced conversion to complete
      setTimeout(() => {
        // Look for DOCX files first (preferred format)
        const docxFile = path.join(inputDir, `${inputBasename}.docx`);
        
        if (fs.existsSync(docxFile)) {
          console.log('Enhanced conversion successful, DOCX file:', docxFile);
          console.log('File size:', fs.statSync(docxFile).size);
          
          // Send the DOCX file
          res.download(docxFile, `${inputBasename}.docx`, (err) => {
            if (err) {
              console.error('Download error:', err);
            }
            // Clean up
            try {
              fs.unlinkSync(inputFile);
              fs.unlinkSync(docxFile);
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError);
            }
          });
        } else {
          console.log('No DOCX file found, trying next enhanced method...');
          commandIndex++;
          return tryEnhancedConversion();
        }
      }, 3000); // Wait 3 seconds for enhanced conversion to complete
    });
  }
  
  // Start with the first enhanced conversion method
  tryEnhancedConversion();
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
