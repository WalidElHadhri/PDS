FROM node:18-alpine

WORKDIR /app

# Copy package files (for better caching)
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port (8080 is standard for Azure App Service)
EXPOSE 8080

# Start server
CMD ["npm", "start"]
