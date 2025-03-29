/**
 * Storage Implementation
 * 
 * @author Mikiyas Birhanu
 * @description This module provides a storage interface and implementation for 
 * user management and authentication. It implements an in-memory storage solution
 * that can be replaced with a database adapter while maintaining the same interface.
 */

import { 
  users, 
  refreshTokens, 
  type User, 
  type InsertUser, 
  type RefreshToken,
  UserStatus,
  UserRole
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Storage interface with CRUD methods for users and authentication
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser & { status?: string; role?: string }): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  
  // RefreshToken methods
  createRefreshToken(userId: number, token: string, expiresIn: number): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: number): Promise<void>;
  
  // Session store
  sessionStore: any; // Use any type to resolve the SessionStore type issue
}

/**
 * In-Memory Storage Implementation
 * 
 * This class provides a non-persistent storage implementation using JavaScript Maps.
 * It's ideal for development and testing but should be replaced with a database
 * implementation for production use.
 */
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tokens: Map<string, RefreshToken>;
  currentId: number;
  tokenId: number;
  sessionStore: any; // Use any type to resolve the SessionStore type issue

  constructor() {
    this.users = new Map();
    this.tokens = new Map();
    this.currentId = 1;
    this.tokenId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add a default admin user for testing
    this.createUser({
      username: "admin",
      password: "$2a$12$o2.RN5V66LGDWZfzj/RB.etT9h7M/q7zi6GccdYd6Q6YzU.m1zJJu", // password: admin123
      email: "admin@example.com",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(userData: InsertUser & { 
    status?: string; 
    role?: string;
    emailVerified?: boolean;
  }): Promise<User> {
    const id = this.currentId++;
    
    // Set default values for new users
    const user: User = {
      id,
      username: userData.username,
      email: userData.email || null,
      password: userData.password,
      role: userData.role || UserRole.USER,
      status: userData.status || UserStatus.ACTIVE,
      emailVerified: userData.emailVerified || false,
      emailVerifyToken: null,
      passwordResetToken: null,
      passwordResetExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) {
      return undefined;
    }

    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) {
      return undefined;
    }

    const updatedUser: User = {
      ...user,
      status,
      updatedAt: new Date()
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    this.users.delete(id);
    // Also delete all refresh tokens for this user
    await this.deleteUserRefreshTokens(id);
  }

  async createRefreshToken(userId: number, token: string, expiresIn: number): Promise<RefreshToken> {
    const id = this.tokenId++;
    const expiresDate = new Date();
    expiresDate.setSeconds(expiresDate.getSeconds() + expiresIn);
    
    const refreshToken: RefreshToken = {
      id,
      token,
      userId,
      expires: expiresDate,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.tokens.set(token, refreshToken);
    return refreshToken;
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    return this.tokens.get(token);
  }

  async deleteRefreshToken(token: string): Promise<void> {
    this.tokens.delete(token);
  }

  async deleteUserRefreshTokens(userId: number): Promise<void> {
    // Use Array.from to convert map entries to array to avoid downlevelIteration issues
    Array.from(this.tokens.entries()).forEach(([token, refreshToken]) => {
      if (refreshToken.userId === userId) {
        this.tokens.delete(token);
      }
    });
  }
}

export const storage = new MemStorage();
