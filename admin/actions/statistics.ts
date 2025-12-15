"use server";

import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function fetchShops() {
  const user = await getServerSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const shops = await prisma.shopifyCustomer.findMany({
    where: {
      shop: {
        not: "",
      },
    },
    distinct: ["shop"],
    select: {
      shop: true,
    },
  });
  return shops.map((shop) => shop.shop);
}

export async function fetchCountries() {
  console.time("fetchCountries");
  const user = await getServerSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  console.timeEnd("fetchCountries");
  const countries = await prisma.shopifyCustomer.findMany({
    where: {
      defaultAddressCountry: {
        not: "",
      },
    },
    distinct: ["defaultAddressCountry"],
    select: {
      defaultAddressCountry: true,
    },
  });
  return countries.map((country) => country.defaultAddressCountry);
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

  const customers = await prisma.shopifyCustomer.findMany({
    where: {
      addedAt: {
        gte: fromDate ? fromDate : undefined,
        lte: toDate ? toDate : undefined,
      },
      defaultAddressCountry: country !== "*" ? country : undefined,
      shop: shop !== "*" ? shop : undefined,
    },
  });
  return customers;
}
