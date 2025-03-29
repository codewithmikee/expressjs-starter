# TypeScript Express.js Backend with Prisma ORM

This project is a monorepo containing a TypeScript Express.js backend with Prisma ORM connected to a SQLite database, and a React frontend with modern tooling.

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/            # Source code
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions and configuration
│   │   ├── pages/      # Route components
│   │   └── ...
├── prisma/             # Prisma ORM configuration and migrations
├── server/             # Backend Express.js server
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Storage abstractions
│   └── ...
├── shared/             # Shared code between frontend and backend
│   └── schema.ts       # Data models and schemas
└── packages/           # Reusable shared packages
```

## Features

- **TypeScript**: Fully typed codebase for better developer experience and code quality
- **Express.js**: Fast, unopinionated web framework for Node.js
- **Prisma ORM**: Type-safe database access with auto-generated client
- **React**: Frontend UI library with modern hooks and patterns
- **TanStack Query**: Data fetching and caching
- **Zod**: Schema validation for runtime type safety
- **ShadCN UI**: Component library with Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework

## API Endpoints

### User Management

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Development

### Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Open the application in your browser at http://localhost:5000

### Database

This project uses SQLite with Prisma ORM. The database schema is defined in `prisma/schema.prisma`.

To update the database schema:

1. Modify the `prisma/schema.prisma` file
2. Run migrations:
   ```
   npx prisma migrate dev --name <migration-name>
   ```

## Frontend

The frontend is built with React and uses Wouter for routing. The pages are defined in `client/src/pages/`.

### Styling

The application uses Tailwind CSS for styling and ShadCN UI components. The theme configuration is in `theme.json`.

## Data Flow

1. The frontend makes API requests to the backend using TanStack Query
2. The backend processes the requests and interacts with the database using Prisma
3. The database returns the data to the backend
4. The backend returns the data to the frontend as JSON
5. The frontend updates the UI with the new data