#!/bin/bash

# Build script for deploying the application with simplified server
echo "Building application..."
npm run build

# Start the simplified server
echo "Starting simplified deployment server..."
NODE_ENV=production node simplified-server.js