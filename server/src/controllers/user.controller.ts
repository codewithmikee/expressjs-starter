/**
 * User Controller
 * 
 * @author Mikiyas Birhanu
 * @description This controller handles user-related operations including
 * retrieving, creating, updating, and deleting users. It uses Prisma ORM
 * for database operations and Zod for request validation.
 */

import { Request, Response } from "express";
import { PrismaClient } from '@prisma/client';
import { z } from "zod";
import { insertUserSchema } from "@shared/schemas";

// Initialize Prisma client
const prisma = new PrismaClient();

/**
 * Get all users
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns Array of all users or error details
 */
export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error: any) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: error.message || "Failed to fetch users" });
  }
}

/**
 * Get user by ID
 * 
 * @param req - Express request object with user ID parameter
 * @param res - Express response object
 * @returns User object or error details if user not found
 */
export async function getUserById(req: Request, res: Response) {
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
}

/**
 * Create a new user
 * 
 * @param req - Express request object with user data in the body
 * @param res - Express response object
 * @returns Newly created user or validation/error details
 */
export async function createUser(req: Request, res: Response) {
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
}

/**
 * Update a user
 * 
 * @param req - Express request object with user ID parameter and updated data in the body
 * @param res - Express response object
 * @returns Updated user object or validation/error details
 */
export async function updateUser(req: Request, res: Response) {
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
}

/**
 * Delete a user
 * 
 * @param req - Express request object with user ID parameter
 * @param res - Express response object
 * @returns Empty response with 204 status code or error details
 */
export async function deleteUser(req: Request, res: Response) {
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
}