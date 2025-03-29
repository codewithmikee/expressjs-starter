/**
 * API Error Response Types
 * 
 * This module defines type definitions for standardized API error responses.
 */

// ZodError types for validation errors
export type ZodErrorDetail = {
  code: string;
  expected: string;  // This can be an empty string
  received: string;  // This can be an empty string
  path: (string | number)[];
  message: string;
};

export type FieldValidationErrors = {
  [field: string]: ZodErrorDetail[];
};

// Base Error Response interface
export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

// General error response
export interface GeneralErrorResponse extends ApiErrorResponse {
  details?: Record<string, any>;
}

// Authentication errors
export interface AuthErrorResponse extends ApiErrorResponse {
  code?: string;
}

// Authorization errors
export interface UnauthorizedErrorResponse extends ApiErrorResponse {
  requiredRole?: string;
}

// Account status errors
export interface AccountStatusErrorResponse extends ApiErrorResponse {
  accountStatus: string; // Changed from 'status' to 'accountStatus' to avoid conflict
  suspendedUntil?: string;
}

// Validation errors
export interface ValidationErrorResponse extends ApiErrorResponse {
  details: FieldValidationErrors;
}

// Not found errors
export interface NotFoundErrorResponse extends ApiErrorResponse {
  resourceType?: string;
  resourceId?: string | number;
}

// Conflict errors
export interface ConflictErrorResponse extends ApiErrorResponse {
  field?: string;
}

// Rate limiting errors
export interface RateLimitErrorResponse extends ApiErrorResponse {
  retryAfter: number; // seconds
}

// Request errors
export interface InvalidRequestErrorResponse extends ApiErrorResponse {
  details?: {
    missingFields?: string[];
    invalidParams?: Record<string, string>;
  };
}

// Union type for all possible error responses
export type ErrorResponse =
  | GeneralErrorResponse
  | AuthErrorResponse
  | UnauthorizedErrorResponse
  | AccountStatusErrorResponse
  | ValidationErrorResponse
  | NotFoundErrorResponse
  | ConflictErrorResponse
  | RateLimitErrorResponse
  | InvalidRequestErrorResponse;