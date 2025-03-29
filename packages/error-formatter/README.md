# API Error Formatter

This package provides standardized error formatting for our API responses, giving frontend developers a consistent way to handle errors across the application.

## Table of Contents

- [Error Response Format](#error-response-format)
- [Standard Error Types](#standard-error-types)
- [Error Status Codes](#error-status-codes)
- [Frontend Usage Examples](#frontend-usage-examples)
- [TypeScript Integration](#typescript-integration)

## Error Response Format

All API errors follow this standard format:

```typescript
{
  error: string;          // A brief error type identifier
  message?: string;       // A more detailed explanation of the error
  details?: any;          // Additional error-specific information
}
```

## Standard Error Types

### Authentication Errors (401)

Returned when a user is not authenticated or has invalid credentials.

```json
{
  "error": "Unauthenticated",
  "message": "Not authenticated"
}
```

### Authorization Errors (403)

Returned when a user doesn't have permission to access a resource.

```json
{
  "error": "Unauthorized",
  "message": "You don't have permission to access this resource",
  "requiredRole": "admin"
}
```

### Account Status Errors (403)

Returned when a user account is inactive, suspended, or disabled.

```json
{
  "error": "Account Suspended",
  "message": "Your account has been suspended",
  "status": "suspended",
  "suspendedUntil": "2025-04-15T00:00:00Z"
}
```

### Validation Errors (400)

Returned when request data fails validation.

```json
{
  "error": "Validation Error",
  "details": {
    "username": [
      {
        "code": "too_small",
        "expected": "3",
        "received": "2",
        "path": ["username"],
        "message": "Username must be at least 3 characters"
      }
    ],
    "email": [
      {
        "code": "invalid_string",
        "path": ["email"],
        "message": "Invalid email address"
      }
    ]
  }
}
```

### Not Found Errors (404)

Returned when a requested resource is not found.

```json
{
  "error": "Not Found",
  "message": "User with ID 123 not found",
  "resourceType": "User",
  "resourceId": "123"
}
```

### Conflict Errors (409)

Returned when a request conflicts with the current state of the server.

```json
{
  "error": "Conflict",
  "message": "Username already exists",
  "field": "username"
}
```

### Rate Limiting Errors (429)

Returned when a client has sent too many requests.

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded",
  "retryAfter": 60
}
```

### Invalid Request Errors (400)

Returned when a request is malformed or contains invalid parameters.

```json
{
  "error": "Invalid Request",
  "message": "Invalid query parameters",
  "details": {
    "invalidParams": {
      "limit": "Must be a number between 1 and 100"
    }
  }
}
```

### Server Errors (500)

Returned when an unexpected error occurs on the server.

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Error Status Codes

| Status Code | Description | Error Type |
|-------------|-------------|------------|
| 400 | Bad Request | Validation Error, Invalid Request |
| 401 | Unauthorized | Authentication Error |
| 403 | Forbidden | Authorization Error, Account Status Error |
| 404 | Not Found | Not Found Error |
| 409 | Conflict | Conflict Error |
| 429 | Too Many Requests | Rate Limit Error |
| 500 | Internal Server Error | Server Error |

## Frontend Usage Examples

### React Query Error Handling

```typescript
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { ErrorResponse } from '@workspace/error-formatter';

function UserProfile({ userId }: { userId: string }) {
  const { toast } = useToast();

  const { data, error, isLoading } = useQuery<User, ErrorResponse>({
    queryKey: ['/api/users', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) {
        // Parse the standardized error response
        const errorData = await res.json();
        throw errorData;
      }
      return res.json();
    },
  });

  // Handle the error based on its type
  React.useEffect(() => {
    if (error) {
      switch (error.error) {
        case 'Not Found':
          toast({
            title: 'User not found',
            description: 'The requested user does not exist',
            variant: 'destructive',
          });
          break;
        case 'Unauthorized':
          toast({
            title: 'Access denied',
            description: 'You don\'t have permission to view this profile',
            variant: 'destructive',
          });
          break;
        default:
          toast({
            title: 'Error',
            description: error.message || 'Failed to load user profile',
            variant: 'destructive',
          });
      }
    }
  }, [error, toast]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading profile</div>;

  return <div>{/* User profile UI */}</div>;
}
```

### Form Validation Error Handling

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest } from '@/lib/queryClient';
import { useMutation } from '@tanstack/react-query';
import { ValidationErrorResponse } from '@workspace/error-formatter';

function RegisterForm() {
  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: '', email: '', password: '' },
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      try {
        const res = await apiRequest('POST', '/api/register', data);
        return await res.json();
      } catch (err) {
        // The API will return a standardized error format
        throw err;
      }
    },
    onError: (error: ValidationErrorResponse) => {
      // If it's a validation error, set the form errors
      if (error.error === 'Validation Error' && error.details) {
        // Map API validation errors to react-hook-form errors
        Object.entries(error.details).forEach(([field, fieldErrors]) => {
          fieldErrors.forEach((fieldError) => {
            form.setError(field as any, {
              type: 'server',
              message: fieldError.message,
            });
          });
        });
      } else {
        toast({
          title: 'Registration failed',
          description: error.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    },
    onSuccess: () => {
      toast({
        title: 'Registration successful',
        description: 'Your account has been created',
      });
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutation.mutate(data);
  });

  return (
    <form onSubmit={onSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## TypeScript Integration

The error-formatter package provides TypeScript interfaces for all error response types, making it easy to implement type-safe error handling in your frontend code.

```typescript
import type {
  ErrorResponse,
  ValidationErrorResponse,
  NotFoundErrorResponse,
  AuthErrorResponse,
} from '@workspace/error-formatter';

// Use in your error handling functions
function handleApiError(error: ErrorResponse) {
  switch (error.error) {
    case 'Validation Error':
      return handleValidationError(error as ValidationErrorResponse);
    case 'Not Found':
      return handleNotFoundError(error as NotFoundErrorResponse);
    case 'Unauthenticated':
      return handleAuthError(error as AuthErrorResponse);
    default:
      return handleGenericError(error);
  }
}
```

By following these standards, we ensure consistent error handling across both the backend and frontend of our application.