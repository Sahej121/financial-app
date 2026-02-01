# Start with a Node.js base image
FROM node:18-slim

# Set working directory
WORKDIR /app

# Install system dependencies for OCR and PDF parsing
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application source
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3001

# Command to run the application
CMD ["npm", "start"]
