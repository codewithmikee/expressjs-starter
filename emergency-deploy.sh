#!/bin/bash

# Emergency fallback deployment script
echo "Building application..."
npm run build

# Start the CommonJS fallback server
echo "Starting emergency fallback server..."
NODE_ENV=production node simple-fallback-server.js