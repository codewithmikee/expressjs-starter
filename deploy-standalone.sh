#!/bin/bash

# Standalone deployment script
echo "Building client application..."
npm run build

# Start the standalone server
echo "Starting standalone server..."
NODE_ENV=production node standalone-server.cjs