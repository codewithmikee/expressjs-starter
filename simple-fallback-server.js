/**
 * Super Minimal Fallback Server
 * 
 * This is a CommonJS version that doesn't use ES modules at all.
 * For use when all other deployment options fail.
 */

// CommonJS imports - no ES modules
const express = require('express');
const path = require('path');
const fs = require('fs');

// Create express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Static file serving
const staticPaths = [
  './dist/public',
  './client/dist',
  './dist',
  '../dist/public',
  '../dist'
];

let staticPathFound = false;
for (const pathOption of staticPaths) {
  const fullPath = path.join(__dirname, pathOption);
  if (fs.existsSync(fullPath)) {
    app.use(express.static(fullPath));
    console.log(`Serving static files from: ${fullPath}`);
    staticPathFound = true;
    break;
  }
}

if (!staticPathFound) {
  console.warn('No static path found. Serving default fallback page only.');
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

// Fallback for SPA or static sites
app.get('*', (req, res) => {
  // Try to find index.html in one of our potential static paths
  for (const pathOption of staticPaths) {
    const indexPath = path.join(__dirname, pathOption, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // If no index.html found anywhere, show a fallback page
  res.status(200).send(`
    <html>
      <head>
        <title>Express TypeScript Starter</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            max-width: 650px;
            margin: 40px auto;
            padding: 0 20px;
            line-height: 1.6;
            color: #333;
          }
          h1 { color: #0070f3; }
          a { color: #0070f3; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .card {
            border: 1px solid #eaeaea;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <h1>Express TypeScript Starter</h1>
        <p>Welcome to your minimal fallback server.</p>
        
        <div class="card">
          <h2>API Status</h2>
          <p>The API health endpoint is available at <a href="/api/health">/api/health</a></p>
        </div>
        
        <div class="card">
          <h2>Deployment Note</h2>
          <p>This is a simplified fallback server for deployment troubleshooting.</p>
          <p>For full functionality, please use the complete application server.</p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Fallback server running at http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});