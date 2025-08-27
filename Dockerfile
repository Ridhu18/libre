FROM node:18-slim

# Install only necessary LibreOffice packages for PDF conversion
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    libreoffice-core \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    libreoffice-common \
    fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and install deps
COPY package.json .
RUN npm install --production

# Copy app files
COPY . .

# Create a non-root user for security
RUN useradd -r -u 1001 -g root nodeuser
USER nodeuser

EXPOSE 3000
CMD ["node", "server.js"]
