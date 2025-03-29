import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";

const router = Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Register all API routes
router.use("/", authRoutes);  // Auth routes: /api/register, /api/login, etc.
router.use("/users", userRoutes); // User routes: /api/users, /api/users/:id, etc.

export default router;