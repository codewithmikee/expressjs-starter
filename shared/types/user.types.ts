/**
 * User Type Definitions
 * 
 * @author Mikiyas Birhanu
 * @description Type definitions for user-related data structures.
 */
import { z } from "zod";
import { UserRole, UserStatus } from "./constants";

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

// Import schemas from schemas directory
import { 
  insertUserSchema, 
  loginSchema, 
  passwordResetRequestSchema, 
  passwordResetSchema, 
  updateUserStatusSchema, 
  tokenResponseSchema 
} from "../schemas";

// Types derived from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type UpdateUserStatus = z.infer<typeof updateUserStatusSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;