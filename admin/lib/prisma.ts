import "dotenv/config";
// import { PrismaPg } from "@prisma/adapter-pg";
// import { PrismaClient } from "@/prisma/generated/client";

// const connectionString = `${process.env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
// const prisma = new PrismaClient({ adapter });

// export { prisma };
import { PrismaClient } from "@/prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());
