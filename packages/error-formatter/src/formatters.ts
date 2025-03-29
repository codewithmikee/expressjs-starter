/**
 * API Error Formatters
 * 
 * This module provides utility functions for formatting standardized API error responses.
 */

import { ZodError } from 'zod';
import type {
  ApiErrorResponse,
  GeneralErrorResponse,
  AuthErrorResponse,
  UnauthorizedErrorResponse,
  AccountStatusErrorResponse,
  ValidationErrorResponse,
  NotFoundErrorResponse,
  ConflictErrorResponse,
  RateLimitErrorResponse,
  InvalidRequestErrorResponse,
  FieldValidationErrors,
  ZodErrorDetail
} from './types';

/**
 * Format a general API error
 */
export function formatApiError(
  error: string,
  message?: string,
  details?: Record<string, any>
): GeneralErrorResponse {
  return {
    error,
    message,
    ...(details && { details }),
  };
}

/**
 * Format an authentication error (401)
 */
export function formatAuthError(
  error = 'Unauthenticated',
  message = 'Not authenticated',
  code?: string
): AuthErrorResponse {
  return {
    error,
    message,
    ...(code && { code }),
  };
}

/**
 * Format an authorization error (403)
 */
export function formatUnauthorizedError(
  error = 'Unauthorized',
  message = 'You don\'t have permission to access this resource',
  requiredRole?: string
): UnauthorizedErrorResponse {
  return {
    error,
    message,
    ...(requiredRole && { requiredRole }),
  };
}

/**
 * Format an account status error (403)
 */
export function formatAccountStatusError(
  accountStatus: string,
  error = 'Account Inactive',
  message = 'Your account is not active',
  suspendedUntil?: string
): AccountStatusErrorResponse {
  return {
    error,
    message,
    accountStatus,
    ...(suspendedUntil && { suspendedUntil }),
  };
}

/**
 * Format a Zod validation error (400)
 */
export function formatZodError(
  zodError: ZodError,
  error = 'Validation Error'
): ValidationErrorResponse {
  const fieldErrors: FieldValidationErrors = {};
  
  zodError.errors.forEach((err) => {
    const field = err.path[0]?.toString() || 'unknown';
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    
    // Create the error detail object matching expected structure
    const errorDetail = {
      code: err.code,
      expected: '',
      received: '',
      path: err.path,
      message: err.message,
    };
    
    fieldErrors[field].push(errorDetail);
  });
  
  return {
    error,
    details: fieldErrors,
  };
}

/**
 * Format a not found error (404)
 */
export function formatNotFoundError(
  error = 'Not Found',
  message?: string,
  resourceType?: string,
  resourceId?: string | number
): NotFoundErrorResponse {
  return {
    error,
    ...(message && { message }),
    ...(resourceType && { resourceType }),
    ...(resourceId !== undefined && { resourceId }),
  };
}

/**
 * Format a conflict error (409)
 */
export function formatConflictError(
  error = 'Conflict',
  message?: string,
  field?: string
): ConflictErrorResponse {
  return {
    error,
    ...(message && { message }),
    ...(field && { field }),
  };
}

/**
 * Format a rate limit error (429)
 */
export function formatRateLimitError(
  retryAfter: number,
  error = 'Too Many Requests',
  message = 'Rate limit exceeded'
): RateLimitErrorResponse {
  return {
    error,
    message,
    retryAfter,
  };
}

/**
 * Format an invalid request error (400)
 */
export function formatInvalidRequestError(
  error = 'Invalid Request',
  message?: string,
  missingFields?: string[],
  invalidParams?: Record<string, string>
): InvalidRequestErrorResponse {
  // Use a typed object
  const requestDetails: {
    missingFields?: string[];
    invalidParams?: Record<string, string>;
  } = {};
  
  if (missingFields && missingFields.length > 0) {
    requestDetails.missingFields = missingFields;
  }
  
  if (invalidParams && Object.keys(invalidParams).length > 0) {
    requestDetails.invalidParams = invalidParams;
  }
  
  return {
    error,
    ...(message && { message }),
    ...(Object.keys(requestDetails).length > 0 && { details: requestDetails }),
  };
}