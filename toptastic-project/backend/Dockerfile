# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Create database directory
RUN mkdir -p database

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 3001, path: '/health', timeout: 2000 }; \
    const request = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); \
    request.on('error', () => process.exit(1)); \
    request.end();"

# Start the application
CMD ["npm", "start"]
