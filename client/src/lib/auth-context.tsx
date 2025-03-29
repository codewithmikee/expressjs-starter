import { createContext, ReactNode } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { LoginCredentials, User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<any, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<any, Error, { refreshToken?: string }>;
  registerMutation: UseMutationResult<any, Error, any>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: userData,
    error,
    isLoading,
  } = useQuery<{user: User} | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Extract the user from the response or return null
  const user = userData?.user || null;

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.username}!`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const res = await apiRequest("POST", "/api/register", userData);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Registration successful",
        description: `Welcome, ${data.user.username}!`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async (data: { refreshToken?: string }) => {
      await apiRequest("POST", "/api/logout", data);
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}