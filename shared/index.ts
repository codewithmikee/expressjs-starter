/**
 * Shared Module Exports
 * 
 * @author Mikiyas Birhanu
 * @description Centralizes exports for all shared code between frontend and backend
 */

// Export from the new modular structure
export * from './types';
export * from './schemas';

/**
 * IMPORTANT: We have removed the export of './schema.ts' to avoid export conflicts.
 * All exports from schema.ts are now available through the types and schemas exports above.
 * If code needs to use the old imports directly from schema.ts, it should be updated
 * to use the new import paths:
 * - For types: import { User, UserRole, etc. } from '@shared/types';
 * - For schemas: import { insertUserSchema, loginSchema, etc. } from '@shared/schemas';
 */