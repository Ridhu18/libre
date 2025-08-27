# Libree PDF Converter Service

A microservice for converting between PDF and DOCX formats using LibreOffice.

## Features

- Convert DOCX files to PDF
- Convert PDF files to DOCX
- Health check endpoint
- File upload handling
- Automatic cleanup of temporary files

## API Endpoints

- `GET /health` - Health check
- `POST /convert/docx-to-pdf` - Convert DOCX to PDF
- `POST /convert/pdf-to-docx` - Convert PDF to DOCX

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the service:
   ```bash
   npm run dev
   ```

3. The service will be available at `http://localhost:3000`

## Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t libree-pdf-converter .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 libree-pdf-converter
   ```

## Render Deployment

1. Connect your GitHub repository to Render
2. Render will automatically detect the `render.yaml` file
3. The service will be deployed automatically

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (default: development)

## Dependencies

- Node.js 18+
- LibreOffice (installed in Docker container)
- Express.js
- Multer (file upload handling)
