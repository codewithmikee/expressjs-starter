/**
 * Database Schema and Types
 * 
 * @author Mikiyas Birhanu
 * @description This module defines validation schemas and exported 
 * TypeScript types that match the Prisma schema. This ensures type consistency
 * between frontend and backend.
 */
import { z } from "zod";

// User status enum
export const UserStatus = {
  ACTIVE: "active",
  DISABLED: "disabled",
  SUSPENDED: "suspended"
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

// User roles enum
export const UserRole = {
  USER: "user",
  ADMIN: "admin"
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

/**
 * User Type Definition
 * 
 * This type matches the Prisma User model
 */
export type User = {
  id: number;
  username: string;
  email: string | null;
  password: string;
  role: string;
  status: string;
  emailVerified: boolean;
  emailVerifyToken: string | null;
  passwordResetToken: string | null;
  passwordResetExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * RefreshToken Type Definition
 * 
 * This type matches the Prisma RefreshToken model
 */
export type RefreshToken = {
  id: number;
  token: string;
  userId: number;
  expires: Date;
  createdAt: Date;
  updatedAt: Date;
};

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

/**
 * Exported TypeScript Types
 * 
 * These types are derived from the schemas and used throughout the application.
 * They ensure type safety and consistency between frontend and backend.
 * The types are used for validation, API requests/responses, and database operations.
 */
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type UpdateUserStatus = z.infer<typeof updateUserStatusSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
