"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/prisma/generated/client";

export async function fetchShops() {
  const user = await getServerSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  // const shops = await prisma.shopifyCustomer.findMany({
  //   where: {
  //     shop: {
  //       not: "",
  //     },
  //   },
  //   distinct: ["shop"],
  //   select: {
  //     shop: true,
  //   },
  //   cacheStrategy: {
  //     ttl: 300, // cache for 5 minutes
  //   },
  // });

  const shops = await prisma.$queryRaw<
    { shop: string }[]
  >`SELECT DISTINCT "shop" FROM public."ShopifyCustomer" WHERE "shop" != ''`;
  return shops.map((shop) => shop.shop);
}

export async function fetchCountries() {
  const user = await getServerSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  // const countries = await prisma.shopifyCustomer.findMany({
  //   where: {
  //     defaultAddressCountry: {
  //       not: "",
  //     },
  //   },
  //   distinct: ["defaultAddressCountry"],
  //   select: {
  //     defaultAddressCountry: true,
  //   },
  //   cacheStrategy: {
  //     ttl: 300, // cache for 5 minutes
  //   },
  // });
  const countries = await prisma.$queryRaw<
    { defaultAddressCountry: string }[]
  >`SELECT DISTINCT "defaultAddressCountry" FROM public."ShopifyCustomer" WHERE "defaultAddressCountry" != ''`;
  return countries.map((country) => country.defaultAddressCountry);
}

export async function fetchCustomer(
  fromDate: Date | undefined,
  toDate: Date | undefined,
  country: string,
  shop: string
) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const PAGE_SIZE = 25000;

  // // Match your original UTC normalization
  // const fromUTC = fromDate
  //   ? new Date(
  //       Date.UTC(
  //         fromDate.getUTCFullYear(),
  //         fromDate.getUTCMonth(),
  //         fromDate.getUTCDate(),
  //         0,
  //         0,
  //         0,
  //         0
  //       )
  //     )
  //   : undefined;

  // const toUTC = toDate
  //   ? new Date(
  //       Date.UTC(
  //         toDate.getUTCFullYear(),
  //         toDate.getUTCMonth(),
  //         toDate.getUTCDate(),
  //         23,
  //         59,
  //         59,
  //         999
  //       )
  //     )
  //   : undefined;

  let cursor: string | undefined = undefined;
  const customers: CustomerDataType[] = [];

  while (true) {
    const whereParts: Prisma.Sql[] = [];

    if (fromDate) {
      // Use real Date objects (recommended), not string-built timestamps
      whereParts.push(Prisma.sql`"addedAt" >= ${fromDate}`);
    }
    if (toDate) {
      // Use real Date objects (recommended), not string-built timestamps
      whereParts.push(Prisma.sql`"addedAt" <= ${toDate}`);
    }
    if (shop !== "*") {
      whereParts.push(Prisma.sql`"shop" = ${shop}`);
    }
    if (country !== "*") {
      whereParts.push(Prisma.sql`"defaultAddressCountry" = ${country}`);
    }

    // Cursor pagination by email (stable if email is unique)
    if (cursor) whereParts.push(Prisma.sql`"email" > ${cursor}`);

    const whereSql =
      whereParts.length > 0
        ? Prisma.sql`WHERE ${Prisma.join(whereParts, ` AND `)}`
        : Prisma.sql``;

    const page = await prisma.$queryRaw<CustomerDataType[]>(
      Prisma.sql`
        SELECT
          "email",
          "shop",
          "defaultAddressCountry",
          "addedAt"
        FROM public."ShopifyCustomer"
        ${whereSql}
        ORDER BY "email" ASC
        LIMIT ${PAGE_SIZE}
      `
    );

    if (page.length === 0) break;

    customers.push(...page);
    cursor = page[page.length - 1].email;
  }

  return customers;
}

export async function fetchStatistics(
  fromDate: Date | undefined,
  toDate: Date | undefined,
  country: string,
  shop: string
) {
  const user = await getServerSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const whereParts: Prisma.Sql[] = [];
  if (fromDate) {
    // Use real Date objects (recommended), not string-built timestamps
    whereParts.push(Prisma.sql`"addedAt" >= ${fromDate}`);
  }
  if (toDate) {
    // Use real Date objects (recommended), not string-built timestamps
    whereParts.push(Prisma.sql`"addedAt" <= ${toDate}`);
  }
  if (shop !== "*") {
    whereParts.push(Prisma.sql`"shop" = ${shop}`);
  }
  if (country !== "*") {
    whereParts.push(Prisma.sql`"defaultAddressCountry" = ${country}`);
  }
  // if (fromDate && toDate) {
  //   // Use real Date objects (recommended), not string-built timestamps
  //   whereParts.push(Prisma.sql`"addedAt" BETWEEN ${fromDate} AND ${toDate}`);
  // }

  const whereSql =
    whereParts.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(whereParts, ` AND `)}`
      : Prisma.sql`WHERE TRUE`;

  const result = await prisma.$queryRaw<
    { count: bigint; addedAt: Date }[]
  >`SELECT Count("email"), "addedAt" FROM public."ShopifyCustomer" ${whereSql} group by "addedAt" order by "addedAt" asc`;
  console.log("Statistics count result:", result);
  return result.map((item) => ({
    count: Number(item.count),
    addedAt: item.addedAt.toISOString(),
  }));
}
