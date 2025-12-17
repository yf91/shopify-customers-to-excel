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
  fromDateISO: string | undefined,
  toDateISO: string | undefined,
  country: string,
  shop: string
) {
  const user = await getServerSession();
  if (!user) throw new Error("Unauthorized");

  const fromDate = fromDateISO ? new Date(fromDateISO) : undefined;
  const toDate = toDateISO ? new Date(toDateISO) : undefined;

  if (fromDate && toDate && toDate < fromDate) {
    return [];
  }

  const PAGE_SIZE = 25000;

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
  fromDateISO: string | undefined,
  toDateISO: string | undefined,
  country: string,
  shop: string
) {
  const user = await getServerSession();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const fromDate = fromDateISO ? new Date(fromDateISO) : undefined;
  const toDate = toDateISO ? new Date(toDateISO) : undefined;

  if (fromDate && toDate && toDate < fromDate) {
    return [];
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

  const whereSql =
    whereParts.length > 0
      ? Prisma.sql`WHERE ${Prisma.join(whereParts, ` AND `)}`
      : Prisma.sql`WHERE TRUE`;

  const result = await prisma.$queryRaw<
    { count: bigint; addedAt: Date }[]
  >`SELECT Count("email"), "addedAt" FROM public."ShopifyCustomer" ${whereSql} group by "addedAt" order by "addedAt" asc`;

  const tmpArr: { addedAt: string; count: number }[] = [];
  if (fromDate && toDate) {
    const tmpDate = new Date(fromDate);
    while (tmpDate <= toDate) {
      tmpArr.push({ addedAt: tmpDate.toISOString(), count: 0 });
      tmpDate.setDate(tmpDate.getDate() + 1);
    }
  }

  // Create a map from result for quick lookup
  const resultMap = new Map(
    result.map((item) => [item.addedAt.toISOString(), Number(item.count)])
  );

  // Merge result into tmpArr
  const mergedData = tmpArr.map((item) => ({
    addedAt: item.addedAt,
    count: resultMap.get(item.addedAt) ?? item.count,
  }));

  return mergedData;
}
