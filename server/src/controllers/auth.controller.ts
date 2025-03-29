import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { storage } from "../services/storage.service";
import { hashPassword } from "../middleware/auth.middleware";
import { UserStatus, UserRole } from "@shared/schema";

/**
 * Handle user registration
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(req.body.username);
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(req.body.password);
    
    // Create the user with default status "active"
    const userData = {
      ...req.body,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
      role: UserRole.USER, // Default role for new users
    };
    
    const user = await storage.createUser(userData);

    // Log the user in after registration
    req.login(user, (err) => {
      if (err) return next(err);
      // Return user data without the password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json({ user: userWithoutPassword });
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
}

/**
 * Handle user login
 */
export function login(req: Request, res: Response, next: NextFunction) {
  passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string } | undefined) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info?.message || "Authentication failed" });
    }
    
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      
      // Return user data without the password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json({ user: userWithoutPassword });
    });
  })(req, res, next);
}

/**
 * Handle user logout
 */
export function logout(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
}

/**
 * Get the currently authenticated user
 */
export function getCurrentUser(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  // Return user data without the password
  const { password, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
}