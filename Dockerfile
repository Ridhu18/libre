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

# Copy package files first for better caching
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && \
    npm ci --production --no-audit --no-fund

# Copy app files
COPY . .

# Create necessary directories for LibreOffice
RUN mkdir -p /root/.config /root/.cache /root/.local/share

# Set environment variables for LibreOffice
ENV HOME=/root
ENV XDG_CONFIG_HOME=/root/.config
ENV XDG_CACHE_HOME=/root/.cache
ENV XDG_DATA_HOME=/root/.local/share

# Expose port
EXPOSE 3000

# Run as root to avoid permission issues
CMD ["node", "server.js"]
