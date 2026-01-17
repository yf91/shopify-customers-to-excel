import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/prisma";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  console.log("OAuth callback received", searchParams);
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");
  const state = searchParams.get("state");
  const hmac = searchParams.get("hmac");

  if (!shop || !code || !state || !hmac) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  // Get stored data from Redis
  const data: {
    clientId: string;
    clientSecret: string;
    state: string;
    userId: string;
  } | null = await redis.get(shop);

  if (!data) {
    return NextResponse.json(
      { error: "Session expired or invalid shop" },
      { status: 400 }
    );
  }

  // Verify state
  if (state !== data.state) {
    return NextResponse.json(
      { error: "Invalid state parameter" },
      { status: 400 }
    );
  }

  // Verify HMAC with stored clientSecret
  if (!verifyHmac(searchParams, hmac, data.clientSecret)) {
    return NextResponse.json({ error: "Invalid HMAC" }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: data.clientId,
          client_secret: data.clientSecret,
          code,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error || "Failed to get access token");
    }

    const { access_token, scope } = tokenData;

    // Save to database
    await prisma.shop.upsert({
      where: { shop },
      update: {
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        accessToken: access_token,
        scope,
        userId: data.userId,
      },
      create: {
        shop,
        clientId: data.clientId,
        clientSecret: data.clientSecret,
        accessToken: access_token,
        scope,
        userId: data.userId,
      },
    });

    console.log("Shop connected successfully:", { shop, scope });

    // Delete from Redis (one-time use)
    await redis.del(shop);

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    );
  } catch (error) {
    console.error("OAuth error:", error);
    // Clean up Redis on error
    await redis.del(shop);

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

function verifyHmac(
  params: URLSearchParams,
  hmac: string,
  clientSecret: string
): boolean {
  const message = Array.from(params.entries())
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  const generatedHash = crypto
    .createHmac("sha256", clientSecret)
    .update(message)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(generatedHash), Buffer.from(hmac));
}
