"use server";

import { getServerSession } from "@/lib/get-session";
import { shopifyFormSchema } from "@/schemas/shopify";
import { ConnectShopFormState } from "@/types/shopify";
import { redirect } from "next/navigation";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/prisma";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function connectShopAction(
  prevState: ConnectShopFormState,
  formData: FormData
): Promise<ConnectShopFormState> {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const shop = formData.get("shop") as string;
  const clientId = formData.get("clientId") as string;
  const clientSecret = formData.get("clientSecret") as string;

  const validatedData = shopifyFormSchema.safeParse({
    shop,
    clientId,
    clientSecret,
  });

  if (!validatedData.success) {
    return {
      errors: validatedData.error.flatten().fieldErrors,
    };
  }

  const state = Math.random().toString(36).substring(7);
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`;

  const result = await redis.set(shop, {
    clientId: clientId,
    clientSecret: clientSecret,
    state: state,
    userId: session.user.id,
  });
  console.log("Redis set result:", result);
  // Store nonce in cookie for verification in callback
  redirect(
    `https://${shop}/admin/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&state=${state}`
  );
}

export async function deleteShopAction(userId: string, shop: string) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  await prisma.shop.delete({
    where: {
      shop: shop,
      userId: session.user.id,
    },
  });
}

export async function fetchShopsAction(userId: string) {
  const session = await getServerSession();
  if (!session || !session.user || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  const shops = await prisma.shop.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return shops;
}
