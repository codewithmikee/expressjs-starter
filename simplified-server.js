/**
 * Simplified Production Server
 * 
 * A minimal server implementation for deployment scenarios
 * that focuses on essential functionality only.
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { createProxyMiddleware } from 'http-proxy-middleware';

// ES Module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create express app
const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(express.json());

// Static file serving from the Vite build output
const staticPath = join(__dirname, './dist/public');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  console.log(`Serving static files from: ${staticPath}`);
} else {
  console.warn(`Static path not found: ${staticPath}`);
  
  // Try alternative paths
  const altPaths = [
    './client/dist',
    '../dist/public',
    './dist',
    '../dist'
  ];
  
  for (const altPath of altPaths) {
    const fullPath = join(__dirname, altPath);
    if (fs.existsSync(fullPath)) {
      console.log(`Found alternative static path: ${fullPath}`);
      app.use(express.static(fullPath));
      break;
    }
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API proxy for authentication and data endpoints
// This will forward API requests to the development server running on port 5000

// Only in production, we'll proxy API requests to the development server
// In development, the simplified server isn't used
if (process.env.NODE_ENV === 'production') {
  try {
    const apiProxy = createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api'
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).json({
          error: 'API proxy error',
          message: 'The API server is unavailable. Please ensure the workflow is running.'
        });
      }
    });
    
    // Apply the proxy middleware to all API routes except health
    app.use('/api', (req, res, next) => {
      if (req.path === '/health') {
        return next();
      }
      return apiProxy(req, res, next);
    });
    
    console.log('API proxy configured to forward requests to development server');
  } catch (error) {
    console.error('Failed to setup API proxy:', error);
  }
}

// Fallback for SPA
app.get('*', (req, res) => {
  // Try multiple possible locations for index.html
  const possiblePaths = [
    join(staticPath, 'index.html'),
    join(__dirname, './dist/public/index.html'),
    join(__dirname, './client/dist/index.html'),
    join(__dirname, './dist/index.html'),
    join(__dirname, '../dist/public/index.html'),
  ];
  
  for (const indexPath of possiblePaths) {
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // If no index.html found, show a basic error page
  res.status(404).send(`
    <html>
      <head><title>Not Found</title></head>
      <body>
        <h1>Page Not Found</h1>
        <p>The requested page could not be found. Please check the URL or go back to the <a href="/">home page</a>.</p>
        <p><small>Note: This is a simplified deployment. For full functionality, please use the development server.</small></p>
      </body>
    </html>
  `);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Simplified server running at http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});