import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
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

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default(UserRole.USER),
  status: text("status").notNull().default(UserStatus.ACTIVE),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailVerifyToken: text("email_verify_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpiry: timestamp("password_reset_expiry"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Refresh token table
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Base user schema for registration
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
}).extend({
  // Add validation rules
  username: z.string().min(3).max(50),
  email: z.string().email().optional(),
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

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type UpdateUserStatus = z.infer<typeof updateUserStatusSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;
