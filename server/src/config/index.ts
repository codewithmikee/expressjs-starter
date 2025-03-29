// Centralized configuration
export default {
  server: {
    port: 5000,
    host: "0.0.0.0",
    reusePort: true,
  },
  auth: {
    sessionSecret: process.env.SESSION_SECRET || "default-secret-for-development-only",
    sessionMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    jwtSecret: process.env.JWT_SECRET || "jwt-secret-for-development-only",
    jwtExpiry: "24h",
    refreshTokenExpiry: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  env: {
    isDevelopment: process.env.NODE_ENV === "development" || !process.env.NODE_ENV,
    isProduction: process.env.NODE_ENV === "production",
    isTest: process.env.NODE_ENV === "test",
  }
};