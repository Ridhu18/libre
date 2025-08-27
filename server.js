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

    // Check if LibreOffice is available and get version info
    exec('libreoffice --version', (libreOfficeError, stdout, stderr) => {
      if (libreOfficeError) {
        console.error('LibreOffice not available:', libreOfficeError);
        return res.status(500).json({ 
          success: false,
          error: 'LibreOffice is not available on this server',
          details: libreOfficeError.message,
          suggestion: 'Please contact support or try again later'
        });
      }
      
      console.log('LibreOffice version info:', stdout);
      if (stderr) console.log('LibreOffice stderr:', stderr);
      
      // Also check LibreOffice help to see available options
      exec('libreoffice --help', (helpError, helpStdout, helpStderr) => {
        if (!helpError) {
          console.log('LibreOffice help output (first 500 chars):', helpStdout.substring(0, 500));
        }
      });
      
      // Check if LibreOffice can list available filters
      exec('libreoffice --infilter=writer_pdf_import --help', (filterError, filterStdout, filterStderr) => {
        if (!filterError) {
          console.log('LibreOffice PDF filter check output:', filterStdout.substring(0, 200));
        } else {
          console.log('LibreOffice PDF filter check error:', filterError);
        }
      });
      
      // Continue with conversion if LibreOffice is available
      const inputFile = req.file.path;
      const inputDir = path.dirname(inputFile);
      const inputBasename = path.basename(req.file.originalname, path.extname(req.file.originalname));
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
      
      // Verify output directory is writable and has proper permissions
      try {
        const testFile = path.join(inputDir, '.test-write');
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('Output directory is writable:', inputDir);
        
        // Check directory permissions
        const stats = fs.statSync(inputDir);
        console.log('Directory permissions:', stats.mode.toString(8));
        console.log('Directory owner:', stats.uid);
        console.log('Directory group:', stats.gid);
        
        // Ensure directory exists and is accessible
        if (!fs.existsSync(inputDir)) {
          fs.mkdirSync(inputDir, { recursive: true, mode: 0o755 });
          console.log('Created output directory:', inputDir);
        }
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
      // Use a timestamp-based name to avoid spaces and special characters
      const timestamp = Date.now();
      const cleanInputFile = path.join(inputDir, `input_${timestamp}.pdf`);
      
      // Also create a clean output filename
      const cleanOutputFile = path.join(inputDir, `output_${timestamp}.docx`);
      
      // Also try with a very simple filename
      const simpleInputFile = path.join(inputDir, `input.pdf`);
      const simpleOutputFile = path.join(inputDir, `input.docx`);
      
      try {
        fs.copyFileSync(inputFile, cleanInputFile);
        fs.copyFileSync(inputFile, simpleInputFile);
        console.log('Created clean input file:', cleanInputFile);
        console.log('Created simple input file:', simpleInputFile);
        console.log('Clean output file will be:', cleanOutputFile);
        console.log('Simple output file will be:', simpleOutputFile);
        
        // Clean output file path is already defined above
        console.log('Expected output file:', cleanOutputFile);
        
        // Try primary conversion method
        const libreOfficeArgs = [
          '--headless',
          '--convert-to', 'docx',
          '--outdir', inputDir,
          '--infilter', 'writer_pdf_import',  // Explicitly specify PDF import filter
          cleanInputFile
        ];
        console.log('Executing command with args:', libreOfficeArgs);
        
        // Also try with explicit output filename
        const libreOfficeArgsWithOutput = [
          '--headless',
          '--convert-to', 'docx',
          '--outdir', inputDir,
          '--infilter', 'writer_pdf_import',
          '--output', cleanOutputFile,
          cleanInputFile
        ];
        console.log('Alternative command with explicit output:', libreOfficeArgsWithOutput);
        
        // Try a different approach - rename the input file to match desired output
        const renamedInputFile = path.join(inputDir, `input_${timestamp}.pdf`);
        const renamedOutputFile = path.join(inputDir, `input_${timestamp}.docx`);
        console.log('Renamed input file:', renamedInputFile);
        console.log('Expected renamed output:', renamedOutputFile);
        
        execFile('libreoffice', libreOfficeArgs, { timeout: 120000 }, (error, stdout, stderr) => {
          console.log('LibreOffice command completed');
          console.log('Command executed:', 'libreoffice', libreOfficeArgs.join(' '));
          console.log('Error:', error);
          console.log('stdout:', stdout);
          console.log('stderr:', stderr);
          if (error) {
            console.error('Primary conversion failed:', error);
            console.error('stderr:', stderr);
            console.error('stdout:', stdout);
            
            // Try alternative method with explicit output
            console.log('Trying alternative conversion method with explicit output...');
            const altArgs = [
              '--headless',
              '--convert-to', 'docx:MS Word 2007 XML',
              '--outdir', inputDir,
              '--infilter', 'writer_pdf_import',  // Explicitly specify PDF import filter
              '--output', cleanOutputFile,
              cleanInputFile
            ];
            
            // Try the alternative command with explicit output first
            console.log('Trying alternative command with explicit output...');
            execFile('libreoffice', libreOfficeArgsWithOutput, { timeout: 120000 }, (outputError, outputStdout, outputStderr) => {
              console.log('Alternative command with explicit output completed');
              console.log('Command executed:', 'libreoffice', libreOfficeArgsWithOutput.join(' '));
              console.log('Output Error:', outputError);
              console.log('Output stdout:', outputStdout);
              console.log('Output stderr:', outputStderr);
              
              if (!outputError) {
                console.log('Alternative command with explicit output succeeded');
                
                // Check if expected output file was created
                console.log('Checking for expected output file:', cleanOutputFile);
                console.log('File exists:', fs.existsSync(cleanOutputFile));
                
                // Give LibreOffice a moment to complete file writing
                setTimeout(() => {
                  console.log('After delay - File exists:', fs.existsSync(cleanOutputFile));
                  processConversionResult(outputStdout, outputStderr);
                }, 1000);
                
                return;
              }
              
              // If that also failed, try the original alternative method
              console.log('Alternative command with explicit output failed, trying original alternative method...');
              
              execFile('libreoffice', altArgs, { timeout: 120000 }, (altError, altStdout, altStderr) => {
                console.log('Alternative LibreOffice command completed');
                console.log('Command executed:', 'libreoffice', altArgs.join(' '));
                console.log('Alt Error:', altError);
                console.log('Alt stdout:', altStdout);
                console.log('Alt stderr:', altStderr);
                
                if (altError) {
                  console.error('Alternative conversion also failed:', altError);
                  
                  // Try third fallback method - different command format with explicit output
                  console.log('Trying third fallback method with explicit output...');
                  const thirdArgs = [
                    '--headless',
                    '--convert-to', 'docx',
                    '--outdir', inputDir,
                    '--output', cleanOutputFile,
                    cleanInputFile
                  ];
                  
                  // Also try with renamed approach
                  const renamedArgs = [
                    '--headless',
                    '--convert-to', 'docx',
                    '--outdir', inputDir,
                    renamedInputFile
                  ];
                  console.log('Fourth method with renamed file:', renamedArgs);
                  
                  // Also try with simple filename approach
                  const simpleArgs = [
                    '--headless',
                    '--convert-to', 'docx',
                    '--outdir', inputDir,
                    simpleInputFile
                  ];
                  console.log('Fifth method with simple file:', simpleArgs);
                  
                  execFile('libreoffice', thirdArgs, { timeout: 120000 }, (thirdError, thirdStdout, thirdStderr) => {
                    console.log('Third LibreOffice command completed');
                    console.log('Command executed:', 'libreoffice', thirdArgs.join(' '));
                    console.log('Third Error:', thirdError);
                    console.log('Third stdout:', thirdStdout);
                    console.log('Third stderr:', thirdStderr);
                    
                    if (thirdError) {
                      console.error('Third method failed, trying renamed approach...');
                      
                      // Try fourth method with renamed file
                      execFile('libreoffice', renamedArgs, { timeout: 120000 }, (renamedError, renamedStdout, renamedStderr) => {
                        console.log('Fourth LibreOffice command completed');
                        console.log('Command executed:', 'libreoffice', renamedArgs.join(' '));
                        console.log('Renamed Error:', renamedError);
                        console.log('Renamed stdout:', renamedStdout);
                        console.log('Renamed stderr:', renamedStderr);
                        
                        if (renamedError) {
                          console.error('Fourth method failed, trying simple filename approach...');
                          
                          // Try fifth method with simple filename
                          execFile('libreoffice', simpleArgs, { timeout: 120000 }, (simpleError, simpleStdout, simpleStderr) => {
                            console.log('Fifth LibreOffice command completed');
                            console.log('Command executed:', 'libreoffice', simpleArgs.join(' '));
                            console.log('Simple Error:', simpleError);
                            console.log('Simple stdout:', simpleStdout);
                            console.log('Simple stderr:', simpleStderr);
                            
                            if (simpleError) {
                              console.error('All conversion methods failed');
                              
                              // Clean up files
                              try {
                                fs.unlinkSync(inputFile);
                                fs.unlinkSync(cleanInputFile);
                                fs.unlinkSync(simpleInputFile);
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
                            
                            console.log('Fifth conversion succeeded');
                            
                            // Check if expected output file was created
                            console.log('Checking for simple output file:', simpleOutputFile);
                            console.log('File exists:', fs.existsSync(simpleOutputFile));
                            
                            // Give LibreOffice a moment to complete file writing
                            setTimeout(() => {
                              console.log('After delay - File exists:', fs.existsSync(simpleOutputFile));
                              processConversionResult(simpleStdout, simpleStderr);
                            }, 1000);
                          });
                          
                          return;
                        }
                        
                        console.log('Fourth conversion succeeded');
                        
                        // Check if expected output file was created
                        console.log('Checking for renamed output file:', renamedOutputFile);
                        console.log('File exists:', fs.existsSync(renamedOutputFile));
                        
                        // Give LibreOffice a moment to complete file writing
                        setTimeout(() => {
                          console.log('After delay - File exists:', fs.existsSync(renamedOutputFile));
                          processConversionResult(renamedStdout, renamedStderr);
                        }, 1000);
                      });
                      
                      return;
                    }
                    
                    console.log('Third conversion succeeded');
                    
                    // Check if expected output file was created
                    console.log('Checking for expected output file:', cleanOutputFile);
                    console.log('File exists:', fs.existsSync(cleanOutputFile));
                    
                    // Give LibreOffice a moment to complete file writing
                    setTimeout(() => {
                      console.log('After delay - File exists:', fs.existsSync(cleanOutputFile));
                      processConversionResult(thirdStdout, thirdStderr);
                    }, 1000);
                  });
                  
                  return;
                }
                
                console.log('Alternative conversion succeeded');
                
                // Check if expected output file was created
                console.log('Checking for expected output file:', cleanOutputFile);
                console.log('File exists:', fs.existsSync(cleanOutputFile));
                
                // Give LibreOffice a moment to complete file writing
                setTimeout(() => {
                  console.log('After delay - File exists:', fs.existsSync(cleanOutputFile));
                  processConversionResult(altStdout, altStderr);
                }, 1000);
              });
              
              return;
            });
            
            return;
          }
   
          console.log('Primary conversion completed successfully');
          console.log('stdout:', stdout);
          if (stderr) console.log('stderr:', stderr);
          
          // Check if expected output file was created
          console.log('Checking for expected output file:', cleanOutputFile);
          console.log('File exists:', fs.existsSync(cleanOutputFile));
          
          // Give LibreOffice a moment to complete file writing
          setTimeout(() => {
            console.log('After delay - File exists:', fs.existsSync(cleanOutputFile));
            processConversionResult(stdout, stderr);
          }, 1000);
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
        // Check if the clean output file exists
        console.log('Looking for clean output file:', cleanOutputFile);
        console.log('Also looking for renamed output file:', renamedOutputFile);
        console.log('Also looking for simple output file:', simpleOutputFile);
        
        // Check if output file exists - try all versions
        let actualOutputFile = null;
        
        if (fs.existsSync(cleanOutputFile)) {
          actualOutputFile = cleanOutputFile;
          console.log('Found clean output file:', actualOutputFile);
        } else if (fs.existsSync(renamedOutputFile)) {
          actualOutputFile = renamedOutputFile;
          console.log('Found renamed output file:', actualOutputFile);
        } else if (fs.existsSync(simpleOutputFile)) {
          actualOutputFile = simpleOutputFile;
          console.log('Found simple output file:', actualOutputFile);
        } else {
          // Try to find any .docx file in the output directory
          try {
            const files = fs.readdirSync(inputDir);
            console.log('Files in output directory:', files);
            
            // Look for any file that might be our output (checking various possibilities)
            const possibleOutputFiles = files.filter(file => {
              const fileLower = file.toLowerCase();
              return fileLower.endsWith('.docx') || 
                     fileLower.includes('input_') ||
                     fileLower.includes('output_');
            });
            
            console.log('Possible output files:', possibleOutputFiles);
            
            const docxFile = files.find(file => file.endsWith('.docx'));
            if (docxFile) {
              actualOutputFile = path.join(inputDir, docxFile);
              console.log('Found output file:', actualOutputFile);
            } else {
              console.log('No .docx files found in output directory');
            }
          } catch (dirError) {
            console.error('Error reading output directory:', dirError);
          }
        }
        
        if (actualOutputFile && fs.existsSync(actualOutputFile)) {
          // Validate the output file
          const stats = fs.statSync(actualOutputFile);
          console.log('Output file size:', stats.size);
          
          if (stats.size === 0) {
            console.log('Output file is empty');
            // Clean up files
            try {
              fs.unlinkSync(inputFile);
              fs.unlinkSync(cleanInputFile);
              fs.unlinkSync(simpleInputFile);
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
          // Send the DOCX file with original filename but .docx extension
          const downloadFilename = `${inputBasename}.docx`;
          res.download(actualOutputFile, downloadFilename, (err) => {
            if (err) {
              console.error('Download error:', err);
            }
            // Clean up files after download
            try {
              fs.unlinkSync(inputFile);
              fs.unlinkSync(cleanInputFile);
              fs.unlinkSync(simpleInputFile);
              fs.unlinkSync(actualOutputFile);
              console.log('Files cleaned up successfully');
            } catch (cleanupError) {
              console.error('Cleanup error:', cleanupError);
            }
          });
        } else {
          console.log('Output file not found');
          console.log('Expected clean output file:', cleanOutputFile);
          console.log('Expected renamed output file:', renamedOutputFile);
          console.log('Expected simple output file:', simpleOutputFile);
          
          // List all files in the directory for debugging
          try {
            const files = fs.readdirSync(inputDir);
            console.log('All files in output directory:', files);
          } catch (listError) {
            console.error('Error listing directory contents:', listError);
          }
          
          // Clean up files
          try {
            fs.unlinkSync(inputFile);
            fs.unlinkSync(cleanInputFile);
            fs.unlinkSync(simpleInputFile);
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }
          
          res.status(500).json({ 
            success: false,
            error: 'Output file not generated',
            details: `Expected files: ${cleanOutputFile}, ${renamedOutputFile}, or ${simpleOutputFile}`,
            suggestion: 'PDF may be corrupted or LibreOffice conversion failed. Check server logs for details.'
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
