import { Router } from "express";
import * as userController from "../controllers/user.controller";
import { isAuthenticated, isAdmin } from "../middleware/auth.middleware";

const router = Router();

// User routes - protected by admin access
router.get("/", isAdmin, userController.getAllUsers);
router.get("/:id", isAuthenticated, userController.getUserById);
router.post("/", isAdmin, userController.createUser);
router.put("/:id", isAdmin, userController.updateUser);
router.delete("/:id", isAdmin, userController.deleteUser);

export default router;