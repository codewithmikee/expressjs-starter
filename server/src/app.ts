import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { createServer, type Server } from "http";
import apiRoutes from "./routes";
import { setupPassport } from "./middleware/auth.middleware";
import { log } from "./utils/logger";
import { setupVite, serveStatic } from "./utils/vite";
import config from "./config";
import { errorHandlerMiddleware, notFoundMiddleware } from "../../packages/error-formatter/src";

export async function createApp(): Promise<{ app: express.Express, server: Server }> {
  const app = express();
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
  
  // 404 handler for routes not found
  app.use(notFoundMiddleware);

  // Setup client-side application (Vite in development, static files in production)
  if (config.env.isDevelopment) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return { app, server };
}