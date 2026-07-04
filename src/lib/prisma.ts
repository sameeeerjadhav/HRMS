import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  adapter: PrismaPg | undefined
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Sameer%4030020101@localhost:5432/hrms_portal';

const pool = new Pool({ connectionString });
const adapter = globalForPrisma.adapter ?? new PrismaPg(pool);

if (process.env.NODE_ENV !== 'production') globalForPrisma.adapter = adapter;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
