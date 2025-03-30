# Deploying to Render

This guide provides detailed instructions for deploying your Express.js + TypeScript + Prisma application to [Render](https://render.com), a modern cloud platform for hosting web applications.

## Why Render?

Render is an excellent choice for deploying Node.js applications because:

- **Zero DevOps**: Simple, push-to-deploy workflow
- **Automatic HTTPS**: TLS certificates are automatically provisioned
- **Database Integration**: Easy PostgreSQL database creation
- **Competitive Pricing**: Free tier available for development
- **Scaling Options**: Easy scaling as your application grows

## Prerequisites

Before deploying to Render, ensure you have:

1. A [Render account](https://dashboard.render.com/register)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. All required environment variables documented

## Deployment Steps

### 1. Create a PostgreSQL Database

1. Log in to your [Render Dashboard](https://dashboard.render.com)
2. Click **New** in the top right, then select **PostgreSQL**
3. Configure your database:
   - **Name**: Choose a name (e.g., `your-app-db`)
   - **Database**: The database name (e.g., `your_app_db`)
   - **User**: Auto-generated or choose your own
   - **Region**: Select the closest region to your users
   - **Plan**: Choose a plan that suits your needs (including the free plan for development)
4. Click **Create Database**
5. Once created, note the **Internal Database URL** for use in your application

### 2. Create a Web Service

1. From your Render Dashboard, click **New** and select **Web Service**
2. Connect your repository:
   - Select your Git provider (GitHub, GitLab, or Bitbucket)
   - Choose the repository containing your application
3. Configure your web service:
   - **Name**: Choose a name for your service (e.g., `your-app-api`)
   - **Region**: Select the same region as your database
   - **Branch**: Usually `main` or `master`
   - **Runtime**: Select **Node**
   - **Build Command**: `npm i -g pnpm && pnpm install && pnpm run build`
   - **Start Command**: `NODE_ENV=production node render-server.cjs`
   - **Plan**: Select an appropriate plan

### 3. Set Environment Variables

1. Scroll down to the **Environment** section
2. Add the following environment variables:
   - `NODE_ENV`: Set to `production`
   - `DATABASE_URL`: Paste the Internal Database URL from your Render PostgreSQL service
   - `SESSION_SECRET`: A strong random string for session encryption
   - Add any other application-specific environment variables

### 4. Create Database Indexes and Seed Data (Optional)

If you need to run migrations after deployment:

1. In your Render Dashboard, select your web service
2. Go to **Shell**
3. Run the following commands:
   ```bash
   npx prisma migrate deploy
   # Only if you need to seed your database
   npx prisma db seed
   ```

### 5. Verify Deployment

1. Once deployment is complete, Render will provide a URL for your application
2. Visit the URL to verify that your application is running correctly
3. Test critical functionality like user authentication and API endpoints

## Continuous Deployment

By default, Render will automatically deploy your application whenever you push changes to your configured branch. To customize this behavior:

1. Go to your web service in the Render Dashboard
2. Click on **Settings**
3. Scroll to the **Auto-Deploy** section
4. Choose your preferred auto-deploy settings

## Performance Optimization

### 1. Add a render.yaml File (Optional)

For more control over your deployment, add a `render.yaml` file to your repository root:

```yaml
services:
  - type: web
    name: your-app-api
    env: node
    buildCommand: npm i -g pnpm && pnpm install && pnpm run build
    startCommand: NODE_ENV=production node render-server.cjs
    plan: starter
    envVars:
      - key: NODE_ENV
        value: production
      - key: SESSION_SECRET
        generateValue: true
      - key: DATABASE_URL
        fromDatabase:
          name: your-app-db
          property: connectionString

databases:
  - name: your-app-db
    plan: starter
```

This configuration provides a declarative way to set up your Render resources.

### 2. Configure Health Checks

Render uses health checks to monitor your application. By default, it will ping the root of your app (`/`). 
Add a dedicated health check endpoint in your application for better monitoring:

```javascript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

### 3. Optimize for Production

Ensure your application is optimized for production:

- Enable compression for HTTP responses
- Use appropriate cache headers
- Configure logging levels for production
- Set up proper error handling

## Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Verify the DATABASE_URL is correct
   - Check if the database service is running
   - Ensure your IP is allowed in the database firewall rules

2. **Application crashes on startup**:
   - Check the logs in your Render Dashboard
   - Verify all required environment variables are set
   - Ensure your build process is completing successfully

3. **"Cannot find module" errors**:
   - Check if all dependencies are listed in package.json
   - Verify that the build process is working correctly
   - Try clearing the build cache and redeploying

4. **"Server Error: Client build files not found"**:
   - This occurs when the server can't locate the client build files
   - Check the build logs to see where the files are being generated
   - Make sure the Vite build is completing successfully
   - If needed, manually update the buildCommand in render.yaml to copy files to the expected location
   - The server looks for client files in multiple locations: dist/public, dist/client, and client/dist

5. **Memory issues**:
   - Optimize your application's memory usage
   - Consider upgrading to a higher tier plan with more resources

## Monitoring

Render provides basic monitoring of your application:

1. **Logs**: Access logs from your service dashboard
2. **Metrics**: View CPU and memory usage metrics
3. **Status**: Monitor the health status of your application

For more advanced monitoring, consider integrating services like:
- Sentry for error tracking
- Datadog for comprehensive monitoring
- LogRocket for session replay and monitoring

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment/deployment)

---

If you encounter any issues not covered in this guide, refer to the [Render Support Documentation](https://render.com/docs) or contact Render support.