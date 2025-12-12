import { prisma } from "@/lib/prisma";

export async function fetchShopsDB() {
  return await prisma.shopifyCustomer.findMany({
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
}
export async function fetchCountriesDB() {
  return await prisma.shopifyCustomer.findMany({
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
}
