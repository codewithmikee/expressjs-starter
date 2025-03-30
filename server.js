/**
 * Replit Deployment Server
 * 
 * Special version of the server for Replit deployment, which uses
 * CommonJS syntax for maximum compatibility.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

// Create express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Serve static files from the client build directory
const clientBuildDir = path.join(__dirname, 'dist/public');
if (fs.existsSync(clientBuildDir)) {
  app.use(express.static(clientBuildDir));
  console.log(`Serving static files from: ${clientBuildDir}`);
} else {
  console.warn(`Client build directory not found at ${clientBuildDir}`);
  
  // Try alternative paths
  const altPaths = [
    './client/dist',
    './dist',
    '../dist/public',
    '../dist'
  ];
  
  for (const altPath of altPaths) {
    const fullPath = path.join(__dirname, altPath);
    if (fs.existsSync(fullPath)) {
      app.use(express.static(fullPath));
      console.log(`Found alternative static path: ${fullPath}`);
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

// Simple demo API for user authentication
// This is a minimal implementation that doesn't use a database
// but provides API endpoints compatible with the frontend
const demoUsers = [
  { 
    id: 1, 
    username: 'demo', 
    password: '$2a$10$9u5bCjfFNDk8l0Ev2xeJTuYQZFYSA3DmxwE1e0bC11CeH.H81ICm2', // 'password'
    email: 'demo@example.com',
    role: 'user',
    status: 'active',
    emailVerified: true,
    emailVerifyToken: null,
    passwordResetToken: null,
    passwordResetExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // In a real implementation, we would validate the password
  // For demo purposes, we'll just check if the username exists
  const user = demoUsers.find(u => u.username === username);
  
  if (user) {
    // In a real implementation, we would set session data
    res.json({ 
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  
  // Check if username already exists
  if (demoUsers.some(u => u.username === username)) {
    return res.status(400).json({ error: 'Username already exists' });
  }
  
  // In a real implementation, we would hash the password and save to DB
  const newUser = { 
    id: demoUsers.length + 1, 
    username, 
    email,
    password: 'hashed_password_would_go_here', 
    role: 'user',
    status: 'active',
    emailVerified: false,
    emailVerifyToken: null,
    passwordResetToken: null,
    passwordResetExpiry: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  demoUsers.push(newUser);
  
  res.status(201).json({ 
    id: newUser.id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    status: newUser.status,
    emailVerified: newUser.emailVerified,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt
  });
});

app.post('/api/logout', (req, res) => {
  // In a real implementation, we would clear the session
  res.status(200).json({ message: 'Logged out successfully' });
});

app.get('/api/user', (req, res) => {
  // In a real implementation, we would check if the user is authenticated
  // and return the user data from the session
  
  // For demo purposes, we'll return a 401
  res.status(401).json({ error: 'Not authenticated' });
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  // Try multiple possible locations for index.html
  const possiblePaths = [
    path.join(clientBuildDir, 'index.html'),
    path.join(__dirname, 'dist/public/index.html'),
    path.join(__dirname, 'client/dist/index.html'),
    path.join(__dirname, 'dist/index.html')
  ];
  
  for (const indexPath of possiblePaths) {
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  
  // If no index.html found, show a basic placeholder
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
          code {
            background: #f0f0f0;
            border-radius: 5px;
            padding: 0.2em 0.4em;
            font-size: 85%;
          }
        </style>
      </head>
      <body>
        <h1>Express TypeScript Starter</h1>
        <p>Welcome to your Express.js application with TypeScript support.</p>
        
        <div class="card">
          <h2>API Endpoints</h2>
          <ul>
            <li><code>GET /api/health</code> - Check API status</li>
            <li><code>POST /api/register</code> - Register new user</li>
            <li><code>POST /api/login</code> - Authenticate user</li>
            <li><code>POST /api/logout</code> - Log out user</li>
            <li><code>GET /api/user</code> - Get current user data</li>
          </ul>
        </div>
        
        <div class="card">
          <h2>Ready to start building?</h2>
          <p>Edit the client source files to customize your application.</p>
          <p>The server is ready to handle API requests and serve your frontend.</p>
        </div>
      </body>
    </html>
  `);
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});