import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "db/client";
import "dotenv/config";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.

const globalForPrisma: { prisma: PrismaClient } = global as unknown as { prisma: PrismaClient };
const adapter: PrismaPg = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma: PrismaClient = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
