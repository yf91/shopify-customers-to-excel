"use server";

import { fetchCountriesDB, fetchShopsDB } from "@/database/statistics";
import { getServerSession } from "@/lib/get-session";
import { prisma } from "@/lib/prisma";

export async function fetchShops() {
  const user = await getServerSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const shops = await fetchShopsDB();
  return shops.map((shop) => shop.shop);
}

export async function fetchCountries() {
  const user = await getServerSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const countries = await fetchCountriesDB();
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
