/**
 * Authentication Hook
 * 
 * @author Mikiyas Birhanu
 * @description This hook provides access to the authentication context
 * for components that need to check authentication status or perform
 * authentication operations.
 */

import { useContext } from "react";
import { AuthContext } from "@/lib/auth-context";

/**
 * React hook that provides access to authentication state and operations
 * 
 * @returns The authentication context containing user data and mutation functions
 * @throws Error if used outside of an AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}