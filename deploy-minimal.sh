#!/bin/bash

# Minimal deployment script
echo "Building application..."
npm run build

# Start the CommonJS server
echo "Starting minimal CommonJS server..."
NODE_ENV=production node server.js