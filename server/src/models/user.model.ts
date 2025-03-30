import { 
  User,
  InsertUser,
  RefreshToken 
} from "@shared/schema";

// Model can include additional type declarations, interfaces and model-specific logic
export interface IUserModel {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser & { status?: string; role?: string; emailVerified?: boolean }): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  updateUserStatus(id: number, status: string): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
}

export interface IRefreshTokenModel {
  createRefreshToken(userId: number, token: string, expiresIn: number): Promise<RefreshToken>;
  getRefreshToken(token: string): Promise<RefreshToken | undefined>;
  deleteRefreshToken(token: string): Promise<void>;
  deleteUserRefreshTokens(userId: number): Promise<void>;
}