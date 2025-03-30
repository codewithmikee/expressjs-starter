# ExpressJS Starter - Deployment Guide

This document provides step-by-step instructions for deploying your Express.js + TypeScript + Prisma application, with a specific focus on deploying to Replit.

## ⭐ RECOMMENDED DEPLOYMENT METHOD FOR REPLIT ⭐

Due to compatibility issues with TypeScript and ES Modules in the Replit deployment environment, we strongly recommend using our new standalone deployment approach:

```bash
./deploy-standalone.sh
```

This script:
1. Builds the client application
2. Starts a standalone CommonJS server that:
   - Doesn't rely on any TypeScript compilation
   - Includes mock authentication (username: `demo`, password: `password`)
   - Serves static files from the build directory
   - Provides all necessary API endpoints
   - Works reliably in Replit's environment

> **Important**: This project uses ES Modules (`"type": "module"` in package.json), which requires special handling for deployment. Using the standalone script above helps avoid common ES Module compatibility issues.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Preparing Your Application](#preparing-your-application)
3. [Deployment on Replit](#deployment-on-replit)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Continuous Deployment](#continuous-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Alternative Deployment Options](#alternative-deployment-options)

## Prerequisites

Before deploying, ensure you have:

- A complete, working application
- A PostgreSQL database (Replit provides one)
- Your environment variables documented
- All dependencies properly listed in package.json

## Preparing Your Application

### 1. Build Your Application

Ensure your application builds successfully:

```bash
# Build the application for production
npm run build
```

The build process:
1. Builds the client-side React application with Vite
2. Compiles TypeScript server code with ES Module compatibility
3. Creates necessary deployment files in the `dist` directory

### 2. Production Start Command

After building, you can start the production server:

```bash
# Start the server in production mode
NODE_ENV=production node dist/index.js

# Or use the shell wrapper
./dist/start.sh
```

This project uses ES Modules for better compatibility with modern Node.js environments. The build process automatically generates all necessary files for deployment.

### 3. Update Configuration for Production

Ensure your application handles production environment settings:

- Use environment variables for configuration
- Set appropriate logging levels
- Configure CORS for your production domain

### 4. Test Locally in Production Mode

Test your application in production mode before deploying:

```bash
npm run build
NODE_ENV=production npm start
```

## Deployment on Replit

### 1. Create a New Repl

1. Log in to [Replit](https://replit.com)
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Enter your repository URL
5. Choose "Node.js" as the language
6. Click "Import from GitHub"

### 2. Configure the Repl

#### Set Up the Run Command

1. In the Repl, click on the "Shell" tab
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the run button by creating a `.replit` file:
   ```
   run = "npm start"
   ```

Or:
1. Click on the "Tools" button in the left sidebar
2. Select "Secrets"
3. Add your environment variables

### 3. Set Up Environment Variables

1. In your Repl, go to the "Secrets" tab in the left sidebar
2. Add the following environment variables:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = `your-secure-secret`
   - Any other application-specific variables

### 4. Database Setup on Replit

#### Option 1: Use Replit Database

1. Click on "Secrets" and add your DATABASE_URL:
   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   ```

#### Option 2: Create a PostgreSQL Database in Replit

1. From your Repl, click on "Tools" in the sidebar
2. Select "Database"
3. Click "Create Database"
4. Choose "PostgreSQL"
5. Once created, Replit will automatically add the DATABASE_URL to your environment variables

### 5. Apply Database Migrations

1. Open the Shell and run:
   ```bash
   npx prisma migrate deploy
   ```
   
2. Or use the db:push command if defined in your package.json:
   ```bash
   npm run db:push
   ```

### 6. Build and Start the Application

1. **IMPORTANT: Do NOT use the regular server for deployment**. Instead, run our deployment script:
   ```bash
   ./deploy.sh
   ```
   
   This script will:
   - Build the client application with `npm run build`
   - Start the simplified server with `NODE_ENV=production node simplified-server.js`
   
   The simplified server is designed to avoid the complex module dependencies and directory structure issues that can cause deployment failures.
   
   **Why this approach is necessary:**
   
   If you encounter persistent issues with ES Module compatibility, you can create a minimal server that only provides essential functionality:
   
   ```javascript
   // simplified-server.js
   import express from 'express';
   import { fileURLToPath } from 'url';
   import { dirname, join } from 'path';
   import fs from 'fs';

   const __filename = fileURLToPath(import.meta.url);
   const __dirname = dirname(__filename);
   const app = express();
   const port = parseInt(process.env.PORT || '3000', 10);

   app.use(express.json());
   
   // Static file serving from the Vite build output
   const staticPath = join(__dirname, './dist/public');
   app.use(express.static(staticPath));
   
   // Health check endpoint
   app.get('/api/health', (req, res) => {
     res.json({ status: 'ok', timestamp: new Date().toISOString() });
   });
   
   // Fallback for SPA
   app.get('*', (req, res) => {
     res.sendFile(join(staticPath, 'index.html'));
   });
   
   app.listen(port, '0.0.0.0', () => {
     console.log(`Server running at http://0.0.0.0:${port}`);
   });
   ```
   
   Run it with:
   ```bash
   NODE_ENV=production node simplified-server.js
   ```
   
   **Emergency Fallback (if nothing else works):**
   
   If you're still experiencing issues with ES Module compatibility, try our CommonJS fallback server:
   
   ```bash
   ./emergency-deploy.sh
   ```
   
   This uses a minimal CommonJS server implementation that completely avoids ES Module syntax and provides 
   only basic functionality.
   
   **RECOMMENDED APPROACH FOR REPLIT DEPLOYMENT:**
   
   For the most reliable deployment on Replit, use our standalone CommonJS server with demo authentication:
   
   ```bash
   ./deploy-standalone.sh
   ```
   
   This starts a standalone-server.cjs file with these features:
   - CommonJS syntax for maximum compatibility
   - Completely self-contained without TypeScript dependencies
   - Static file serving for the client build
   - Full API endpoints that match the frontend expectations
   - In-memory authentication with a demo user (username: demo, password: password)
   
   The standalone server provides the most reliable deployment option while completely avoiding all the 
   complex TypeScript/ES Module issues that can occur in the Replit environment.

### 7. Verify Deployment

1. Click on the "Webview" tab to see your running application
2. Test critical functionality like user registration and login
3. Check API endpoints using tools like Postman or the browser

## Continuous Deployment

### Setting Up GitHub Integration for Automatic Deployments

1. On Replit, go to your Repl settings
2. Under "GitHub", connect your GitHub repository
3. Enable "Auto-update from GitHub"
4. Configure branch settings as needed

## Environment Variables

Ensure these environment variables are properly set in your production environment:

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | `production` |
| PORT | Server port | `3000` |
| DATABASE_URL | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| SESSION_SECRET | Secret for session encryption | `your-secret-key` |

## Troubleshooting

### Common Deployment Issues

1. **Application crashes on startup**
   - Check logs for errors
   - Verify environment variables are set correctly
   - Ensure database connection is working

   ```bash
   # Check logs
   cat .replit/logs/console.log
   ```

2. **Database connection issues**
   - Confirm DATABASE_URL is correctly formatted
   - Check if database is accessible from Replit
   - Test connection:
   
   ```bash
   npx prisma db pull
   ```

3. **Missing environment variables**
   - Double-check all required variables are set in Secrets
   - Verify your application is reading them correctly

4. **ES Module compatibility issues**
   - If you see errors like "Dynamic require of 'express' is not supported", check that:
     - The `type` field in package.json is set to `module`
     - All imports use ES module syntax (no `require()` calls)
     - Server code is properly built with ES module compatibility
   - Possible fixes:
     ```bash
     # Fix ES Module issues by rebuilding
     npm run build
     ```

5. **Performance issues**
   - Optimize your database queries
   - Consider adding caching
   - Check if you're hitting Replit's resource limits

## Alternative Deployment Options

While this guide focuses on Replit, you can deploy this application to other platforms:

### Heroku

1. Create a Heroku account and install the Heroku CLI
2. Create a new app:
   ```bash
   heroku create your-app-name
   ```
3. Add a PostgreSQL database:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```
4. Push your code:
   ```bash
   git push heroku main
   ```
5. Run migrations:
   ```bash
   heroku run npx prisma migrate deploy
   ```

### Render

1. Create a Render account
2. Connect your GitHub repository
3. Create a new Web Service with:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add a PostgreSQL database from Render's dashboard
5. Set up environment variables

### Railway

1. Create a Railway account
2. Connect your GitHub repository
3. Add a PostgreSQL database
4. Configure environment variables
5. Deploy your application

---

This deployment guide provides a comprehensive set of instructions for deploying your Express.js application to Replit. If you encounter issues not covered in this guide, please refer to Replit's documentation or contact their support team.