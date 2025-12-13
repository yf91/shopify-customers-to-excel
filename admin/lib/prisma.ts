import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    adapter,
  });
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter,
    });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
