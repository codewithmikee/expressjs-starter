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

// Try multiple possible client build directories based on how Vite might build
// Based on vite.config.ts, client files should be in dist/public
const possibleClientDirs = [
  path.join(distDir, 'public'),    // From vite.config.ts
  path.join(distDir, 'client'),    // Our modification in render.yaml
  path.join(rootDir, 'client', 'dist'), // Alternative client location
  distDir                          // Fallback
];

let clientDistDir = distDir; // Default fallback
for (const dir of possibleClientDirs) {
  if (fs.existsSync(dir)) {
    // Check if the directory contains index.html or other client files
    if (fs.existsSync(path.join(dir, 'index.html'))) {
      clientDistDir = dir;
      console.log(`[Render Server] Found client files in: ${clientDistDir}`);
      break;
    } else {
      console.log(`[Render Server] Directory exists but no index.html found in: ${dir}`);
      try {
        const files = fs.readdirSync(dir);
        if (files.length > 0) {
          console.log(`[Render Server] Files in ${dir}:`, files);
        }
      } catch (err) {
        console.error(`[Render Server] Error reading directory ${dir}:`, err.message);
      }
    }
  } else {
    console.log(`[Render Server] Directory doesn't exist: ${dir}`);
  }
}

console.log(`[Render Server] Using client dist directory: ${clientDistDir}`);

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
    // List available directories to help with debugging
    const availableDirs = [];
    
    if (fs.existsSync(distDir)) {
      availableDirs.push(`${distDir} (exists)`);
      
      try {
        const distContents = fs.readdirSync(distDir);
        availableDirs.push(`- Contents of ${distDir}: ${distContents.join(', ')}`);
      } catch (err) {
        availableDirs.push(`- Error reading ${distDir}: ${err.message}`);
      }
    } else {
      availableDirs.push(`${distDir} (does not exist)`);
    }
    
    if (fs.existsSync(path.join(rootDir, 'client'))) {
      availableDirs.push(`${path.join(rootDir, 'client')} (exists)`);
      
      const clientDistDirAlt = path.join(rootDir, 'client', 'dist');
      if (fs.existsSync(clientDistDirAlt)) {
        availableDirs.push(`${clientDistDirAlt} (exists)`);
        
        try {
          const clientDistContents = fs.readdirSync(clientDistDirAlt);
          availableDirs.push(`- Contents of ${clientDistDirAlt}: ${clientDistContents.join(', ')}`);
        } catch (err) {
          availableDirs.push(`- Error reading ${clientDistDirAlt}: ${err.message}`);
        }
      } else {
        availableDirs.push(`${clientDistDirAlt} (does not exist)`);
      }
    }
    
    console.error('[Render Server] Client build files not found. Available directories:', availableDirs);
    
    res.status(500).send(`
      <html>
        <head>
          <title>Server Error</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 650px; margin: 2rem auto; padding: 0 1rem; }
            h1 { color: #e53e3e; }
            pre { background: #f7fafc; padding: 1rem; border-radius: 0.25rem; overflow-x: auto; }
            .note { background: #ebf8ff; padding: 1rem; border-radius: 0.25rem; margin: 1rem 0; }
          </style>
        </head>
        <body>
          <h1>Server Error: Client Build Files Not Found</h1>
          <p>The server could not locate the client build files. This typically occurs when the build process didn't complete correctly or the files were not generated in the expected location.</p>
          
          <div class="note">
            <p><strong>Debugging Information:</strong></p>
            <p>Looking for index.html in: ${indexPath}</p>
            <p>Current client dist directory: ${clientDistDir}</p>
          </div>
          
          <h2>Available Directories:</h2>
          <pre>${availableDirs.join('\n')}</pre>
          
          <h2>Possible Solutions:</h2>
          <ul>
            <li>Verify that the build command in render.yaml is correctly generating the client files</li>
            <li>Check build logs for any errors during the build process</li>
            <li>Ensure the Vite configuration is correctly set up to output files to the expected location</li>
            <li>Try manually running the build process locally to see if it produces the expected files</li>
          </ul>
        </body>
      </html>
    `);
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