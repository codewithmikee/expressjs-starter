# Code with Mike Backend - Express.js TypeScript Starter

A scalable TypeScript Express.js backend designed for modern web application development, providing a robust and extensible foundation for complex digital solutions.

## Project Structure

```
├── client/                    # Frontend React application
│   ├── src/                   # Source code
│   │   ├── components/        # UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and configuration
│   │   ├── pages/             # Route components
│   │   └── ...
├── prisma/                    # Prisma ORM configuration and migrations
├── server/                    # Backend Express.js server
│   ├── src/                   # Server source code
│   │   ├── controllers/       # Request handlers
│   │   ├── middleware/        # Express middleware
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Business logic
│   │   ├── app.ts             # Express application setup
│   │   └── index.ts           # Server entry point
├── shared/                    # Shared code between frontend and backend
│   ├── schemas/               # Validation schemas
│   ├── types/                 # TypeScript type definitions
│   ├── schema.ts              # Legacy schema definitions (for backward compatibility)
│   └── index.ts               # Shared module exports
└── packages/                  # Reusable shared packages
    └── error-formatter/       # Error handling utilities
```

## Key Features

- **TypeScript**: Full type safety throughout the application
- **Express.js**: Robust API routing with modular organization
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Authentication**: Session-based auth with Passport.js and PostgreSQL store
- **React Frontend**: Modern React with hooks and TanStack Query
- **Validation**: Comprehensive request validation with Zod
- **Error Handling**: Standardized error responses with custom middleware
- **UI Components**: ShadCN UI with Tailwind CSS styling

## Authentication System

The application implements a complete authentication system with:

- User registration with password hashing
- Login with secure session management
- Session persistence with PostgreSQL session store
- Protection of routes with authentication middleware
- User status management (active, disabled, suspended)
- Role-based authorization

## API Endpoints

### Authentication

- `POST /api/register` - Register a new user
- `POST /api/login` - Authenticate a user
- `POST /api/logout` - Log out a user
- `GET /api/user` - Get the current authenticated user

### Health Check

- `GET /api/health` - Check API status

## Development

### Prerequisites

- Node.js 18+ 
- PostgreSQL database

### Setup

1. Clone the repository:
   ```
   git clone https://github.com/codewithmikee/expressjs-starter.git
   cd expressjs-starter
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables (create a `.env` file with your PostgreSQL connection details)

4. Start the development server:
   ```
   npm run dev
   ```

5. Access the application at http://localhost:5000

### Database Management

This project uses PostgreSQL with Prisma ORM. The database schema is defined in `prisma/schema.prisma`.

To update the database schema:

1. Modify the `prisma/schema.prisma` file
2. Run migrations:
   ```
   npx prisma migrate dev --name <migration-name>
   ```

## Frontend

The frontend is built with React and uses:

- **Wouter**: Lightweight routing
- **TanStack Query**: Data fetching and state management
- **React Hook Form**: Form handling with Zod validation
- **ShadCN UI**: Component library with clean design
- **Tailwind CSS**: Utility-first styling

## Security Features

- Password hashing with scrypt
- Session-based authentication
- CSRF protection
- Custom error handling to prevent information leakage
- Input validation for all requests

## Data Flow

1. Client makes API requests to Express.js backend
2. Authentication middleware validates requests when needed
3. Controllers process requests and use services for business logic
4. Services interact with the database via Prisma ORM
5. Responses are formatted and returned with appropriate status codes
6. React frontend manages state with TanStack Query