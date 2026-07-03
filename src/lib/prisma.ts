import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  adapter: PrismaMariaDb | undefined
}

const adapter = globalForPrisma.adapter ?? new PrismaMariaDb({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'u587292075_portal',
  connectionLimit: 10
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.adapter = adapter;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
