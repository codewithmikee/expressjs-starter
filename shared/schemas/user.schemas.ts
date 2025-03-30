/**
 * User Schema Definitions
 * 
 * @author Mikiyas Birhanu
 * @description Validation schemas for user-related operations.
 */
import { z } from "zod";
import { UserStatus } from "../types";

/**
 * User Registration/Creation Schema
 * 
 * Defines validation rules for user registration and creation:
 * - Username: 3-50 characters, required
 * - Email: Valid email format, optional
 * - Password: 8-100 characters, required
 */
export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().optional().nullable(),
  password: z.string().min(8).max(100),
});

// Login schema
export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
});

// Password reset schema
export const passwordResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8).max(100),
});

// Update user status schema
export const updateUserStatusSchema = z.object({
  status: z.enum([UserStatus.ACTIVE, UserStatus.DISABLED, UserStatus.SUSPENDED]),
});

// Token response schema
export const tokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});