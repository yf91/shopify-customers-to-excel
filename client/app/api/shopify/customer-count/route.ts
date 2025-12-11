import { NextRequest, NextResponse } from "next/server";

const API_VERSION = "2025-10";
const query = `query CustomerCount {
  customersCount(limit: null) {
    count
  }
}`;
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shop, apiKey, variables } = body;

    if (!shop || !apiKey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const SHOPIFY_ENDPOINT = `https://${shop}/admin/api/${API_VERSION}/graphql.json`;

    const res = await fetch(SHOPIFY_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": apiKey,
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

    return NextResponse.json(json);
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
