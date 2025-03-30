import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { createServer, type Server } from "http";
import cors from "cors";
import apiRoutes from "./routes";
import { setupPassport } from "./middleware/auth.middleware";
import { log } from "./utils/logger";
import { setupVite, serveStatic } from "./utils/vite";
import config from "./config";
import { errorHandlerMiddleware, notFoundMiddleware } from "../../packages/error-formatter/src";

export async function createApp(): Promise<{ app: express.Express, server: Server }> {
  const app = express();
  
  // Simple CORS middleware implementation
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Max-Age', '86400');
      res.sendStatus(200);
    } else {
      next();
    }
  });
  log("CORS middleware enabled using custom implementation");
  
  // Other middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());

  // Add request logging middleware
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  // Setup authentication
  setupPassport(app);

  // Mount API routes
  app.use("/api", apiRoutes);

  // Create HTTP server
  const server = createServer(app);

  // Global error handling middleware from error-formatter package
  app.use(errorHandlerMiddleware);
  
  // Setup client-side application (Vite in development, static files in production)
  if (config.env.isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  
  // 404 handler for routes not found (should be last)
  app.use(notFoundMiddleware);

  return { app, server };
}