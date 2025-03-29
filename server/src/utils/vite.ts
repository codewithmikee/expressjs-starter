import type { Express } from "express";
import type { Server } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { log } from "./logger";

export async function setupVite(app: Express, server: Server) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("setupVite should not be called in production");
  }

  const { createServer: createViteServer } = await import("vite");
  
  const vite = await createViteServer({
    server: { 
      middlewareMode: true,
      host: '0.0.0.0',
      hmr: {
        // Allow connections from any host
        host: '0.0.0.0',
        clientPort: 5000
      },
      cors: true,
      origin: '*',
    },
    appType: "custom",
    preview: {
      host: '0.0.0.0',
      port: 5000,
    },
  });

  app.use(vite.middlewares);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Skip API routes
      if (url.startsWith('/api')) {
        return next();
      }

      // Use a non-SSR approach - serve the index.html directly
      const __dirname = dirname(fileURLToPath(import.meta.url));
      const srcPath = join(__dirname, "../../../client", "index.html");

      // 1. Read index.html
      const fs = await import("fs/promises");
      let template = await fs.readFile(srcPath, "utf-8");

      // 2. Apply Vite HTML transforms
      template = await vite.transformIndexHtml(url, template);
      
      // 3. Send the transformed HTML (no SSR)
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e: any) {
      // If an error is caught, let vite fix the stack trace so it maps back
      // to your actual source code.
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const express = require("express");
  const path = require("path");
  
  const clientDistPath = path.join(__dirname, "../../dist/client");
  
  // Serve static files
  app.use(express.static(clientDistPath, {
    index: false // Don't serve index.html for / route
  }));

  // Wildcard route to serve index.html for client-side routing
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}