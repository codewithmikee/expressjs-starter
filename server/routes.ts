import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { PrismaClient } from '@prisma/client';
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import { setupAuth } from "./auth";

// Initialize Prisma client
const prisma = new PrismaClient();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: error.message || "Failed to fetch users" });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const user = await prisma.user.findUnique({
        where: { id }
      });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: error.message || "Failed to fetch user" });
    }
  });

  // Create a new user
  app.post("/api/users", async (req, res) => {
    try {
      // Validate request body using Zod schema
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid user data", 
          details: validationResult.error.format() 
        });
      }

      const userData = validationResult.data;
      
      // Create the user in the database
      const newUser = await prisma.user.create({
        data: userData
      });

      res.status(201).json(newUser);
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        return res.status(409).json({ 
          error: "Username already exists",
          field: error.meta?.target?.[0] 
        });
      }
      
      res.status(500).json({ error: error.message || "Failed to create user" });
    }
  });

  // Update a user
  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Validate request body
      const validationResult = insertUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid user data", 
          details: validationResult.error.format() 
        });
      }

      const userData = validationResult.data;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: userData
      });

      res.json(updatedUser);
    } catch (error: any) {
      console.error("Error updating user:", error);
      
      // Handle unique constraint violations
      if (error.code === 'P2002') {
        return res.status(409).json({ 
          error: "Username already exists",
          field: error.meta?.target?.[0] 
        });
      }
      
      res.status(500).json({ error: error.message || "Failed to update user" });
    }
  });

  // Delete a user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete user
      await prisma.user.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: error.message || "Failed to delete user" });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}
