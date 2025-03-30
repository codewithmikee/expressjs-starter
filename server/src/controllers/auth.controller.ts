/**
 * Authentication Controller
 * 
 * @author Mikiyas Birhanu
 * @description This controller handles all authentication-related operations including
 * user registration, login, logout, and retrieving the current authenticated user.
 * It uses Passport.js for authentication and session management.
 */

import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { storage } from "../services/storage.service";
import { hashPassword } from "../middleware/auth.middleware";
import { UserStatus, UserRole } from "@shared/types";
import { insertUserSchema, loginSchema } from "@shared/schemas";

/**
 * Handle user registration
 * 
 * @param req - Express request object containing registration data
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns User data on successful registration or error details
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate request body using the Zod schema
    const validationResult = insertUserSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: "Validation Error", 
        message: "Invalid registration data",
        details: validationResult.error.format() 
      });
    }
    
    const validatedData = validationResult.data;
    
    // Check if username already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(409).json({ 
        error: "Conflict Error", 
        message: "Username already exists",
        field: "username"
      });
    }

    // Hash the password before storing
    const hashedPassword = await hashPassword(validatedData.password);
    
    // Create the user with default status "active"
    const userData = {
      ...validatedData,
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
    next(error); // Pass to error handler middleware
  }
}

/**
 * Handle user login
 * 
 * @param req - Express request object containing login credentials
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns User data on successful login or error details
 */
export function login(req: Request, res: Response, next: NextFunction) {
  // Validate request body using the login schema
  const validationResult = loginSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return res.status(400).json({ 
      error: "Validation Error", 
      message: "Invalid login credentials",
      details: validationResult.error.format() 
    });
  }
  
  passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string } | undefined) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ 
        error: "Authentication Error", 
        message: info?.message || "Invalid username or password"
      });
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
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns Success message on successful logout or error details
 */
export function logout(req: Request, res: Response, next: NextFunction) {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ 
      success: true,
      message: "Logged out successfully" 
    });
  });
}

/**
 * Get the currently authenticated user
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns User data for the authenticated user or authentication error
 */
export function getCurrentUser(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      error: "Authentication Error", 
      message: "Not authenticated" 
    });
  }
  
  // Return user data without the password
  const { password, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
}