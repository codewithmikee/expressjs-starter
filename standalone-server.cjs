/**
 * Standalone Server for Replit Deployment
 * 
 * This is a completely self-contained server file that doesn't
 * depend on any TypeScript compilation or complex imports.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');

// Create express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Configure CORS middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow any origin in development
    // In production, you might want to restrict this to specific domains
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true, // Allow cookies to be sent with requests
  maxAge: 86400 // Cache preflight requests for 24 hours
};

// Apply CORS middleware to all routes
app.use(cors(corsOptions));
console.log('CORS middleware enabled');

// In-memory users and sessions (for demo purposes only)
const users = [
  {
    id: 1,
    username: 'demo',
    passwordHash: 'fce10dd2b90757613239ebe242c14870f1c0fd55e3395b0f82d7e22f9b77a525', // 'password'
    email: 'demo@example.com',
    role: 'user',
    status: 'active'
  }
];

const sessions = {};

// Simple hash function (NOT for production use)
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate a random session ID
function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

// Serve static files from the build directory
const staticDirs = [
  './dist/public',
  './client/dist',
  './dist'
];

let staticDirFound = false;

for (const dir of staticDirs) {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    app.use(express.static(fullPath));
    console.log(`Serving static files from: ${fullPath}`);
    staticDirFound = true;
    break;
  }
}

if (!staticDirFound) {
  console.warn('No static directory found. Serving API only.');
}

// Auth middleware
function requireAuth(req, res, next) {
  const sessionId = req.get('Authorization')?.replace('Bearer ', '');
  
  if (sessionId && sessions[sessionId]) {
    req.user = sessions[sessionId];
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// API routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

app.post('/api/register', (req, res) => {
  const { username, password, email } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  // Check if username already exists
  if (users.some(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  const newUser = {
    id: users.length + 1,
    username,
    passwordHash: hashPassword(password),
    email: email || null,
    role: 'user',
    status: 'active'
  };
  
  users.push(newUser);
  
  // Create a session
  const sessionId = generateSessionId();
  const user = { ...newUser };
  delete user.passwordHash; // Don't include the password hash in the session
  
  sessions[sessionId] = user;
  
  res.status(201).json({
    user,
    token: sessionId
  });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  const user = users.find(u => u.username === username);
  
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Create a session
  const sessionId = generateSessionId();
  const sessionUser = { ...user };
  delete sessionUser.passwordHash; // Don't include the password hash in the session
  
  sessions[sessionId] = sessionUser;
  
  res.status(200).json({
    user: sessionUser,
    token: sessionId
  });
});

app.post('/api/logout', requireAuth, (req, res) => {
  const sessionId = req.get('Authorization')?.replace('Bearer ', '');
  
  if (sessionId) {
    delete sessions[sessionId];
  }
  
  res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/user', requireAuth, (req, res) => {
  res.status(200).json(req.user);
});

// Default response for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
  // Look for index.html in the static directories
  for (const dir of staticDirs) {
    const indexPath = path.join(__dirname, dir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // If no index.html is found, serve a fallback HTML
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Express TypeScript App</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-top: 40px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
          color: #0070f3;
        }
        .card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        code {
          background-color: #f0f0f0;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: Menlo, Monaco, Lucida Console, Liberation Mono, DejaVu Sans Mono, Bitstream Vera Sans Mono, Courier New, monospace;
        }
        .button {
          background-color: #0070f3;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          transition: background-color 0.2s;
        }
        .button:hover {
          background-color: #005cc5;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Express TypeScript App</h1>
        <p>Welcome to your Express.js application. This is a fallback page displayed when your application's static files cannot be found.</p>
        
        <div class="card">
          <h2>API Status</h2>
          <p>The API is running. You can check its status at <a href="/api/health">/api/health</a>.</p>
        </div>
        
        <div class="card">
          <h2>Demo Authentication</h2>
          <p>You can use the following credentials to test the authentication:</p>
          <pre><code>Username: demo
Password: password</code></pre>
          <p>Or register a new user through the API.</p>
        </div>
        
        <div class="card">
          <h2>API Endpoints</h2>
          <ul>
            <li><code>GET /api/health</code> - Check API status</li>
            <li><code>POST /api/register</code> - Register a new user</li>
            <li><code>POST /api/login</code> - Log in</li>
            <li><code>POST /api/logout</code> - Log out (requires authentication)</li>
            <li><code>GET /api/user</code> - Get current user data (requires authentication)</li>
          </ul>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Standalone server running on http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});