/**
 * API Error Handling Middleware
 * 
 * This module provides Express middleware for consistent error handling.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  formatApiError,
  formatZodError,
} from './formatters';

/**
 * Custom API Error class that can be thrown within route handlers
 */
export class ApiError extends Error {
  status: number;
  details?: Record<string, any>;

  constructor(message: string, status = 500, details?: Record<string, any>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Custom Not Found Error
 */
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource', id?: string | number) {
    const message = id 
      ? `${resource} with ID ${id} not found` 
      : `${resource} not found`;
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * Custom Unauthorized Error
 */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(message, 403);
    this.name = 'UnauthorizedError';
  }
}

/**
 * Custom Authentication Error
 */
export class AuthenticationError extends ApiError {
  constructor(message = 'Not authenticated') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * Custom Validation Error
 */
export class ValidationError extends ApiError {
  constructor(message = 'Validation error', details?: Record<string, any>) {
    super(message, 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Custom Conflict Error
 */
export class ConflictError extends ApiError {
  constructor(message = 'Resource already exists', field?: string) {
    super(message, 409, field ? { field } : undefined);
    this.name = 'ConflictError';
  }
}

/**
 * Global error handler middleware
 */
export function errorHandlerMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error for debugging
  console.error(`Error [${req.method} ${req.path}]:`, err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const formattedError = formatZodError(err);
    return res.status(400).json(formattedError);
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    const formattedError = formatApiError(
      err.name,
      err.message,
      err.details
    );
    return res.status(err.status).json(formattedError);
  }

  // Handle unknown errors
  const formattedError = formatApiError(
    'Internal Server Error',
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message
  );
  
  return res.status(500).json(formattedError);
}

/**
 * Catch-all for 404 errors (route not found)
 */
export function notFoundMiddleware(
  req: Request,
  res: Response
) {
  const formattedError = formatApiError(
    'Not Found',
    `Route ${req.method} ${req.path} not found`
  );
  
  return res.status(404).json(formattedError);
}