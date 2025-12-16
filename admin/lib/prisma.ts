// Default settings
// import { PrismaClient } from "@/prisma/generated/client";
// import { withAccelerate } from "@prisma/extension-accelerate";

// const globalForPrisma = global as unknown as {
//   prisma: PrismaClient & ReturnType<typeof withAccelerate>;
// };

// const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     accelerateUrl: process.env.DATABASE_URL!,
//   }).$extends(withAccelerate());

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }

// export { prisma };

// Using Production DB with Accelerate in development for testing purposes
import { PrismaClient } from "@/prisma/generated/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate());

export { prisma };

// export { prisma };
