import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = 
  globalForPrisma.prisma || 
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: 'pretty'
  });

// Ensure database connection
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((err) => {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}