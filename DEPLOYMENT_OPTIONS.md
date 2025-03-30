# Deployment Options

This project is designed to be deployable to multiple platforms with minimal configuration. Below are the available deployment options and instructions for each.

## Quick Reference

| Platform | Configuration | Documentation | Script |
|----------|--------------|---------------|--------|
| Replit   | `.replit` file | [DEPLOYMENT.md](./DEPLOYMENT.md) | `./deploy-standalone.sh` |
| Render   | `render.yaml` | [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) | `./deploy-render.sh` |

## 1. Replit Deployment

Replit is ideal for quick deployments and prototyping.

### Key Benefits
- Zero configuration deployment
- Integrated development environment
- Free tier available
- Automatic HTTPS

### Instructions
1. Follow the detailed instructions in [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Use the standalone server deployment script: `./deploy-standalone.sh`
3. When deploying through the Replit UI, set:
   - Build command: `npm run build`
   - Run command: `NODE_ENV=production node standalone-server.cjs`

## 2. Render Deployment

Render provides more scalable options for production deployments.

### Key Benefits
- Infrastructure as code with `render.yaml`
- Integrated PostgreSQL database
- Auto-deployment from Git
- Easy horizontal scaling

### Instructions
1. Follow the detailed instructions in [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)
2. Use the Render deployment script: `./deploy-render.sh`
3. Connect your Git repository to Render for automatic deployments

## 3. Custom Server Deployment

For advanced deployments to other platforms (AWS, GCP, Azure, etc.), this project includes multiple server configurations.

### Available Server Files

| File | Description | Use Case |
|------|-------------|----------|
| `server.js` | CommonJS server for general deployment | Basic Node.js hosts |
| `standalone-server.cjs` | Self-contained server for Replit | Replit and similar platforms |
| `render-server.cjs` | Optimized server for Render | Render deployments |
| `simplified-server.js` | Minimal server implementation | Testing and debugging |

### Environment Variables

All deployments require these environment variables:

```
NODE_ENV=production
DATABASE_URL=<your-postgres-connection-string>
SESSION_SECRET=<random-secure-string>
```

## Troubleshooting

If you encounter issues with deployment:

1. Check the logs for specific error messages
2. Verify that all environment variables are properly set
3. Ensure the database is accessible from your deployment platform
4. For Replit-specific issues, refer to the Replit documentation
5. For Render-specific issues, refer to the Render documentation

## Package Manager Options

This project supports multiple package managers:

- **npm**: The default package manager (used in most deployment scripts)
- **pnpm**: Fully supported with render.yaml and deploy-render.sh configurations
- **yarn**: Compatible but requires manual configuration adjustments

### Using pnpm for Render Deployment

The project includes pnpm support for Render deployment. The render.yaml file is configured to:
1. Install pnpm globally: `npm i -g pnpm`
2. Use pnpm for installing dependencies: `pnpm install`
3. Use pnpm for building the project: `pnpm run build`

The deploy-render.sh script automatically detects if pnpm is available and uses it preferentially over npm.

## Need More Help?

If you need additional assistance with deployment, please:

1. Check the relevant platform's documentation
2. Refer to the project's GitHub repository issues
3. Contact the project maintainers

---

Remember to secure your deployment by:
1. Using environment variables for sensitive data
2. Implementing proper authentication
3. Setting up HTTPS
4. Configuring appropriate CORS policies