import { Router } from "express";
import * as authController from "../controllers/auth.controller";

const router = Router();

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/user", authController.getCurrentUser);

export default router;