/**
 * Render Deployment Server
 * 
 * Special version of the server for Render deployment, which uses
 * CommonJS syntax for maximum compatibility.
 */

// Force production mode
process.env.NODE_ENV = 'production';

// Required dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');
const { createServer } = require('http');

// Initialize Express app
const app = express();

// Enable trust proxy for Render's proxy setup
app.set('trust proxy', 1);

// Root directory setup (avoid '/repo/' paths to ensure portability)
const rootDir = path.resolve('.');
const distDir = path.join(rootDir, 'dist');
const clientDistDir = path.join(distDir, 'client');

// Add request logging
app.use((req, res, next) => {
  const startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Basic security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Add health check endpoint for Render monitoring
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    memoryUsage: process.memoryUsage()
  });
});

// Use built server module if available
try {
  // Check if the compiled server file exists
  const serverIndexPath = path.join(distDir, 'server', 'src', 'index.js');
  
  if (fs.existsSync(serverIndexPath)) {
    console.log('[Render Server] Loading compiled server module');
    
    // Use dynamic import for the compiled server
    const serverModule = require(serverIndexPath);
    
    // If the server module exports a startServer function, use it
    if (typeof serverModule.startServer === 'function') {
      console.log('[Render Server] Starting server using module export');
      serverModule.startServer();
      // Exit early as the server module will handle all routing
      return;
    }
  }
} catch (err) {
  console.error('[Render Server] Error loading server module:', err);
}

// Fallback to serving static files if server module isn't available
console.log('[Render Server] Using static file serving fallback');

// Compression for production
try {
  const compression = require('compression');
  app.use(compression());
  console.log('[Render Server] Compression middleware enabled');
} catch (err) {
  console.warn('[Render Server] Compression middleware not available, skipping');
}

// Serve static files from client/dist
if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir, {
    maxAge: '1d', // Cache static assets for 1 day
    etag: true
  }));
  console.log(`[Render Server] Serving static files from: ${clientDistDir}`);
} else {
  console.warn(`[Render Server] Client dist directory not found: ${clientDistDir}`);
}

// API fallback response
app.use('/api', (req, res) => {
  res.status(503).json({
    error: 'Service Unavailable',
    message: 'API server is not running or not properly initialized',
    status: 503
  });
});

// SPA fallback for client routes
app.get('*', (req, res) => {
  // Check if index.html exists
  const indexPath = path.join(clientDistDir, 'index.html');
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(500).send('Server Error: Client build files not found');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[Render Server] Server running on port ${PORT}`);
});

// Handle termination signals for graceful shutdown
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    console.log(`[Render Server] ${signal} received, shutting down gracefully`);
    httpServer.close(() => {
      console.log('[Render Server] HTTP server closed');
      process.exit(0);
    });
    
    // Force close after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      console.error('[Render Server] Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  });
});