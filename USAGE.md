# ExpressJS Starter - Usage Instructions

This document provides comprehensive instructions for both frontend and backend developers on how to effectively use this Express.js + TypeScript + Prisma template.

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Backend Development](#backend-development)
5. [Frontend Development](#frontend-development)
6. [Database Operations](#database-operations)
7. [Authentication](#authentication)
8. [API Documentation](#api-documentation)
9. [Troubleshooting](#troubleshooting)

## Overview

This template provides a robust foundation for building full-stack applications with:

- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React with TypeScript
- **Authentication**: Session-based authentication with Passport.js
- **Type Safety**: Shared types between frontend and backend

## Project Structure

The project follows a monorepo structure:

```
/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── ...
├── server/               # Backend Express application
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── ...
├── shared/               # Shared code between client and server
│   ├── schemas/          # Zod validation schemas
│   ├── types/            # TypeScript type definitions
│   └── ...
├── prisma/               # Prisma ORM configuration and migrations
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
     SESSION_SECRET="your-secret-key"
     ```

### Running the Application

Start the development server:

```bash
npm run dev
```

This will start both the backend Express server and the frontend React application.

## Backend Development

### Creating a New Controller

1. Create a new file in `server/src/controllers/`
2. Follow the pattern of existing controllers, using proper JSDoc documentation:

```typescript
/**
 * Example Controller
 * 
 * @author Your Name
 * @description Handles operations for examples
 */

import { Request, Response } from "express";

/**
 * Get all examples
 * 
 * @param req - Express request object
 * @param res - Express response object
 * @returns Array of examples or error details
 */
export async function getAllExamples(req: Request, res: Response) {
  try {
    // Implementation
    res.json({ examples: [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
```

### Creating Routes

1. Create a new file in `server/src/routes/`
2. Define your routes using Express Router:

```typescript
import { Router } from "express";
import * as exampleController from "../controllers/example.controller";

const router = Router();

router.get("/examples", exampleController.getAllExamples);
// Add more routes as needed

export default router;
```

3. Register your router in `server/src/app.ts`

### Middleware

Add custom middleware in `server/src/middleware/` and apply them in your routes or globally in `app.ts`.

## Frontend Development

### Adding a New Page

1. Create a new component in `client/src/pages/`
2. Add the route to `client/src/App.tsx`:

```tsx
// In Router component
<Route path="/new-page" component={NewPage} />
```

### Protected Routes

Use the `ProtectedRoute` component for routes that require authentication:

```tsx
<ProtectedRoute path="/dashboard" component={Dashboard} />
```

### Authentication

Use the `useAuth` hook to access authentication state and functions:

```tsx
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, loginMutation, logoutMutation, registerMutation } = useAuth();
  
  // Check if user is logged in
  if (user) {
    // User is authenticated
  }
  
  // Login function
  const handleLogin = (credentials) => {
    loginMutation.mutate(credentials);
  };
  
  // Rest of your component
}
```

### Making API Requests

Use the TanStack Query hooks for data fetching:

```tsx
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/resource'],
  // getQueryFn is already configured, no need to define it
});

// Mutate data
const mutation = useMutation({
  mutationFn: async (newData) => {
    const res = await apiRequest("POST", "/api/resource", newData);
    return res.json();
  },
  onSuccess: () => {
    // Invalidate queries to refetch data
    queryClient.invalidateQueries(['/api/resource']);
  },
});

// Use the mutation
mutation.mutate(newData);
```

## Database Operations

### Prisma Schema

The database schema is defined in `prisma/schema.prisma`. When you make changes to this file, you need to generate new Prisma client code and apply migrations.

### Migrations

To create and apply migrations:

1. Make changes to `prisma/schema.prisma`
2. Generate migration files:
   ```bash
   npx prisma migrate dev --name description_of_changes
   ```
3. Apply migrations:
   ```bash
   npx prisma migrate deploy
   ```

Or use the shortcut:

```bash
npm run db:push
```

### Using Prisma Client

Import the Prisma client to perform database operations:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Example: Get all users
const users = await prisma.user.findMany();

// Example: Create a user
const user = await prisma.user.create({
  data: {
    username: "johndoe",
    email: "john@example.com",
    password: hashedPassword,
    role: "user",
    status: "active",
  },
});
```

## Authentication

This template uses session-based authentication with Passport.js and PostgreSQL session store.

### User Registration

POST to `/api/register` with:
```json
{
  "username": "username",
  "email": "user@example.com",
  "password": "password"
}
```

### User Login

POST to `/api/login` with:
```json
{
  "username": "username",
  "password": "password"
}
```

### User Logout

POST to `/api/logout`

### Get Current User

GET to `/api/user`

## API Documentation

The API follows RESTful conventions:

| Method | Endpoint         | Description               | Auth Required |
|--------|------------------|---------------------------|---------------|
| GET    | /api/health      | Check API health          | No            |
| POST   | /api/register    | Register new user         | No            |
| POST   | /api/login       | Login user                | No            |
| POST   | /api/logout      | Logout user               | Yes           |
| GET    | /api/user        | Get current user          | Yes           |
| GET    | /api/users       | Get all users             | Yes           |
| GET    | /api/users/:id   | Get user by ID            | Yes           |
| PUT    | /api/users/:id   | Update user               | Yes           |
| DELETE | /api/users/:id   | Delete user               | Yes           |

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check that PostgreSQL is running
   - Verify your DATABASE_URL environment variable is correct

2. **Authentication Issues**
   - Make sure SESSION_SECRET is properly set
   - Check that your session store is properly configured

3. **Type Errors**
   - Run `npm run build` to check for TypeScript errors
   - Check that your shared types are properly exported

### Debugging

- Use the built-in logger for server-side debugging
- Check browser console for client-side issues
- For database issues, use Prisma Studio:
  ```bash
  npx prisma studio
  ```

---

This documentation is designed to give you a comprehensive understanding of how to use this template. If you encounter any issues not covered here, please refer to the project's GitHub repository or contact the project maintainers.