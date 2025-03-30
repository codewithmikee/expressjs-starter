import { 
  type User, 
  type InsertUser, 
  type RefreshToken,
  UserStatus,
  UserRole
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { IUserModel, IRefreshTokenModel } from "../models/user.model";
import { prisma } from "./db.service";

// Create PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Storage interface with CRUD methods for users and authentication
export interface IStorage extends IUserModel, IRefreshTokenModel {
  // Session store
  sessionStore: session.Store;
}

export class PrismaStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true
    });
    
    // Try to add a default admin user for initial setup
    this.ensureAdminUserExists();
  }

  private async ensureAdminUserExists() {
    try {
      // Check if we have any users
      const userCount = await prisma.user.count();
      
      if (userCount === 0) {
        // Create a default admin user if no users exist
        await this.createUser({
          username: "admin",
          password: "$2a$12$o2.RN5V66LGDWZfzj/RB.etT9h7M/q7zi6GccdYd6Q6YzU.m1zJJu", // password: admin123
          email: "admin@example.com",
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
          emailVerified: true
        });
      }
    } catch (error) {
      console.error("Failed to create admin user:", error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const user = await prisma.user.findUnique({ 
        where: { id }
      });
      return user || undefined;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const user = await prisma.user.findUnique({ 
        where: { username }
      });
      return user || undefined;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return undefined;
    }
  }

  async getUsers(): Promise<User[]> {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  }

  async createUser(userData: InsertUser & { 
    status?: string; 
    role?: string;
    emailVerified?: boolean;
  }): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email || null,
          password: userData.password,
          role: userData.role || UserRole.USER,
          status: userData.status || UserStatus.ACTIVE,
          emailVerified: userData.emailVerified || false,
          emailVerifyToken: null,
          passwordResetToken: null,
          passwordResetExpiry: null
        }
      });
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      return await prisma.user.update({
        where: { id },
        data: userData
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return undefined;
    }
  }

  async updateUserStatus(id: number, status: string): Promise<User | undefined> {
    try {
      return await prisma.user.update({
        where: { id },
        data: { status }
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await prisma.user.delete({ where: { id } });
      // Refresh tokens will be automatically deleted due to cascade delete
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  async createRefreshToken(userId: number, token: string, expiresIn: number): Promise<RefreshToken> {
    try {
      const expiresDate = new Date();
      expiresDate.setSeconds(expiresDate.getSeconds() + expiresIn);
      
      return await prisma.refreshToken.create({
        data: {
          token,
          userId,
          expires: expiresDate
        }
      });
    } catch (error) {
      console.error("Error creating refresh token:", error);
      throw error;
    }
  }

  async getRefreshToken(token: string): Promise<RefreshToken | undefined> {
    try {
      const refreshToken = await prisma.refreshToken.findUnique({
        where: { token }
      });
      return refreshToken || undefined;
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return undefined;
    }
  }

  async deleteRefreshToken(token: string): Promise<void> {
    try {
      await prisma.refreshToken.delete({
        where: { token }
      });
    } catch (error) {
      console.error("Error deleting refresh token:", error);
    }
  }

  async deleteUserRefreshTokens(userId: number): Promise<void> {
    try {
      await prisma.refreshToken.deleteMany({
        where: { userId }
      });
    } catch (error) {
      console.error("Error deleting user refresh tokens:", error);
    }
  }
}

// Export a singleton instance
export const storage = new PrismaStorage();