# Project Structure

This document provides an overview of the main folders and subfolders in the project, along with descriptions of their purpose.

## Root Structure

- **client/** - Frontend React application
- **server/** - Backend Express.js application
- **prisma/** - Database schema and migrations
- **packages/** - Shared utilities and modules
- **shared/** - Shared types and schemas between client and server

## Client

The `client/` directory contains the frontend React application.

- **src/** - Source code for the React application
  - **components/** - Reusable UI components
    - **ui/** - Shadcn UI components
  - **hooks/** - Custom React hooks
  - **lib/** - Utility functions and shared logic
    - **utils/** - Helper functions
  - **pages/** - Page components corresponding to routes
    - **users/** - User management pages
  - **App.tsx** - Main application component
  - **main.tsx** - Application entry point

## Server

The `server/` directory contains the backend Express.js application.

- **auth.ts** - Authentication setup and logic
- **routes.ts** - API route definitions
- **storage.ts** - Data storage and retrieval interface
- **index.ts** - Server entry point
- **vite.ts** - Vite integration for serving the frontend
- **db.ts** - Database connection setup

## Prisma

The `prisma/` directory contains database-related files.

- **schema.prisma** - Database schema definition
- **migrations/** - Database migration files

## Packages

The `packages/` directory contains shared modules used across the project.

- **utils/** - Utility functions that can be used by both client and server
  - **src/** - Source code for utilities

## Shared

The `shared/` directory contains types and schemas shared between client and server.

- **schema.ts** - Database table definitions, validation schemas, and shared types

## Configuration Files

- **.env** - Environment variables
- **drizzle.config.ts** - Drizzle ORM configuration
- **package.json** - Project dependencies and scripts
- **tailwind.config.ts** - Tailwind CSS configuration
- **theme.json** - Application theme configuration
- **tsconfig.json** - TypeScript compiler configuration
- **vite.config.ts** - Vite bundler configuration