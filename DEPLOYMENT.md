# ExpressJS Starter - Deployment Guide

This document provides step-by-step instructions for deploying your Express.js + TypeScript + Prisma application, with a specific focus on deploying to Replit.

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
pnpm run build
```

### 2. Create a Production Start Command

Make sure your package.json has a "start" script for production:

```json
"scripts": {
  "start": "node dist/server/index.js",
  "build": "tsc"
}
```

### 3. Update Configuration for Production

Ensure your application handles production environment settings:

- Use environment variables for configuration
- Set appropriate logging levels
- Configure CORS for your production domain

### 4. Test Locally in Production Mode

Test your application in production mode before deploying:

```bash
pnpm run build
NODE_ENV=production pnpm start
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
   pnpm install
   ```
3. Configure the run button by creating a `.replit` file:
   ```
   run = "pnpm start"
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
   pnpm prisma migrate deploy
   ```
   
2. Or use the db:push command if defined in your package.json:
   ```bash
   pnpm run db:push
   ```

### 6. Build and Start the Application

1. In the Shell, build your application:
   ```bash
   pnpm run build
   ```
   
2. Start your application:
   ```bash
   pnpm start
   ```

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
   pnpm prisma db pull
   ```

3. **Missing environment variables**
   - Double-check all required variables are set in Secrets
   - Verify your application is reading them correctly

4. **Performance issues**
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
   heroku run pnpm prisma migrate deploy
   ```

### Render

1. Create a Render account
2. Connect your GitHub repository
3. Create a new Web Service with:
   - Build Command: `pnpm install && pnpm run build`
   - Start Command: `pnpm start`
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