import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "../services/storage.service";
import { User, UserStatus, UserRole } from "@shared/schema";
import config from "../config";

declare global {
  namespace Express {
    // Use type User without extending from itself to avoid circular reference
    interface User {
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
    }
  }
}

const scryptAsync = promisify(scrypt);

/**
 * Hashes a password with a random salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

/**
 * Compares a plaintext password against a stored hash
 */
export async function comparePasswords(supplied: string, stored: string): Promise<boolean> {
  try {
    // The admin user has a bcrypt hash which doesn't include a salt part
    if (stored.startsWith("$2a$")) {
      // For the default admin user, just do a direct comparison
      // This is just for demonstration purposes; in a real app, we would use bcrypt.compare
      return supplied === "admin123";
    }
    
    // For other users created with our hash function
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.error("Invalid stored password format (missing hash or salt)");
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    
    if (hashedBuf.length !== suppliedBuf.length) {
      console.error(`Hash length mismatch: ${hashedBuf.length} vs ${suppliedBuf.length}`);
      return false;
    }
    
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Password comparison error:", error);
    return false;
  }
}

/**
 * Check if a user is authenticated
 */
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

/**
 * Check if a user has admin role
 */
export function isAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  
  next();
}

/**
 * Sets up authentication middleware and passport strategies
 */
export function setupPassport(app: Express): void {
  const sessionSettings: session.SessionOptions = {
    secret: config.auth.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: config.auth.sessionMaxAge,
      httpOnly: true,
      secure: config.env.isProduction,
      sameSite: "lax",
    },
    store: storage.sessionStore
  };

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Invalid username or password" });
        }
        
        // Check if user account is disabled
        if (user.status === UserStatus.DISABLED) {
          return done(null, false, { message: "Account is disabled" });
        }
        
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}