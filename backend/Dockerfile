FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for development)
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Start server (can be overridden in docker-compose)
CMD ["node", "server.js"]
