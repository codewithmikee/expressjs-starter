/**
 * Production Server Entry Point (ES Module Compatible)
 * 
 * This is a simplified version of the server that's compatible with ES modules
 * and can be used for deployment.
 */

import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// ES Module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create express app
const app = express();
const port = parseInt(process.env.PORT || '3001', 10); // Use a different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Static file serving - note: Vite built files go into 'dist/public'
const staticPath = join(__dirname, './dist/public');
if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  console.log(`Serving static files from: ${staticPath}`);
} else {
  console.warn(`Static path not found: ${staticPath}`);
  console.warn(`Current directory: ${__dirname}`);
  console.warn(`Files in current directory: ${fs.readdirSync(__dirname).join(', ')}`);
  
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

// Health check endpoint (for verifying the server is running)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Simple API endpoint documentation
app.get('/api', (req, res) => {
  res.json({
    name: 'Express TypeScript API',
    description: 'Backend API for the application',
    endpoints: [
      { path: '/api/health', method: 'GET', description: 'Health check endpoint' },
      { path: '/api/register', method: 'POST', description: 'Register a new user' },
      { path: '/api/login', method: 'POST', description: 'Login a user' },
      { path: '/api/logout', method: 'POST', description: 'Logout the current user' },
      { path: '/api/user', method: 'GET', description: 'Get the current user' }
    ]
  });
});

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
  console.log(`Production server running at http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});