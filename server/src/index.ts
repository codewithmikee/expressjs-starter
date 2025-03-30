
/**
 * Server Entry Point - Modified for ES Module Compatibility
 * 
 * This version has been optimized to handle ES module requirements for deployment.
 * We avoid dynamic requires and ensure consistent module loading patterns.
 */

// ES Module imports (import only what we need statically)
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES Module compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the express application
const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Max-Age', '86400');
    res.sendStatus(200);
    return;
  }
  next();
});
console.log("CORS middleware enabled");

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Set up static file serving with proper error handling
const staticPath = join(__dirname, '../../client/dist');
try {
  app.use(express.static(staticPath));
  console.log(`Serving static files from: ${staticPath}`);
} catch (error) {
  console.error('Error setting up static file serving:', error);
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Fallback route for SPA in production
if (process.env.NODE_ENV === 'production') {
  try {
    const indexPath = join(__dirname, '../../client/dist/index.html');
    app.get('*', (req, res) => {
      res.sendFile(indexPath);
    });
    console.log(`Configured fallback route to: ${indexPath}`);
  } catch (error) {
    console.error('Error setting up fallback route:', error);
  }
}

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
