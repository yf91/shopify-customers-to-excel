import { NextRequest, NextResponse } from "next/server";
import { ShopifyCustomer } from "@/types/shopify";
import { prisma } from "@/lib/prisma";
import { shopifyFormSchema } from "@/schemas/shopify";

const API_VERSION = "2025-10";
const query = `
      query Customers($cursor: String) {
        customers(first: 250, after: $cursor) {
          edges {
            cursor
            node {
              email
              firstName
              lastName
              createdAt
              phone
              verifiedEmail
              validEmailAddress
              numberOfOrders
              amountSpent {
                amount
                currencyCode
              }
              defaultAddress {
                address1
                city
                country
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }`;
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shop, accessToken, variables } = body;

    // const result = shopifyFormSchema.safeParse({ shop, accessToken });

    // if (!result.success) {
    //   return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
    // }

    const SHOPIFY_ENDPOINT = `https://${shop}/admin/api/${API_VERSION}/graphql.json`;

    const res = await fetch(SHOPIFY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query,
        variables: variables ?? null,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Shopify API error:", errorText);
      return NextResponse.json(
        { error: "Shopify API request failed" },
        { status: res.status }
      );
    }

    const json = await res.json();

    if (json.errors) {
      console.error("GraphQL errors:", json.errors);
      return NextResponse.json(
        { error: "GraphQL errors", details: json.errors },
        { status: 400 }
      );
    }

    try {
      const edges = json.data.customers.edges as {
        cursor: string;
        node: ShopifyCustomer;
      }[];
      const now = new Date();
      const addedAt = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0
        )
      );
      const customers = edges.map((e) => e.node);
      const filteredCustomers = customers.filter((c) => c.email);
      await prisma.shopifyCustomer.createMany({
        data: filteredCustomers.map((customer) => ({
          shop: shop || "",
          email: customer.email || "",
          firstName: customer.firstName || "",
          lastName: customer.lastName || "",
          createdAt: customer.createdAt || "",
          phone: customer.phone || "",
          verifiedEmail: customer.verifiedEmail || false,
          validEmailAddress: customer.validEmailAddress || false,
          numberOfOrders: customer.numberOfOrders || "",
          amountSpentAmount: customer.amountSpent?.amount || "",
          amountSpentCurrencyCode: customer.amountSpent?.currencyCode || "",
          defaultAddressAddress1: customer.defaultAddress?.address1 || "",
          defaultAddressCity: customer.defaultAddress?.city || "",
          defaultAddressCountry: customer.defaultAddress?.country || "",
          addedAt: addedAt,
        })),
        skipDuplicates: true,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error processing customers:");
      console.error("Name:", error?.name);
      console.error("Message:", error?.message);
      console.error("Code:", error?.code);
      console.error("Meta:", error?.meta);
      console.error(error);
    } finally {
      await prisma.$disconnect();
    }

    return NextResponse.json(json);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
