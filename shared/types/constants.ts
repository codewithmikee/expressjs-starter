/**
 * Constants used throughout the application
 * 
 * @author Mikiyas Birhanu
 * @description Centralized constants that are used in multiple places
 */

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