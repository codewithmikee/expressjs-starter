import { createApp } from "./app";
import config from "./config";
import { log } from "./utils/logger";

async function startServer() {
  try {
    const { app, server } = await createApp();
    
    // Start the server
    server.listen({
      port: config.server.port,
      host: config.server.host,
      reusePort: config.server.reusePort,
    }, () => {
      log(`Server running at http://${config.server.host}:${config.server.port}`);
    });
    
    // Handle shutdown gracefully
    ["SIGINT", "SIGTERM"].forEach((signal) => {
      process.on(signal, () => {
        log(`${signal} received. Shutting down gracefully...`);
        server.close(() => {
          log("HTTP server closed");
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();