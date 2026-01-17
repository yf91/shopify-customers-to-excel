"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useActionState, useState } from "react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";
import { connectShopAction } from "@/actions/shopify";

export function ConnectShopSection() {
  const [shop, setShop] = useState(
    process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? ""
  );
  const [clientId, setClientId] = useState(
    process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_ID ?? ""
  );
  const [clientSecret, setClientSecret] = useState(
    process.env.NEXT_PUBLIC_SHOPIFY_CLIENT_SECRET ?? ""
  );

  const [state, formAction, isPending] = useActionState(connectShopAction, {
    errors: {},
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>2. Connect to Shopify Store via App</CardTitle>
        <CardDescription>
          Insert your store credentials to connect your Shopify store.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={formAction} id="shopify-credentials-form">
          <FieldGroup>
            <Field
              data-invalid={!!state.errors?.shop?.length}
              data-disabled={isPending}
            >
              <FieldLabel htmlFor="shop">Internal Shop URL</FieldLabel>
              <Input
                id="shop"
                name="shop"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                disabled={isPending}
                aria-invalid={!!state.errors?.shop?.length}
                placeholder="your-shop.myshopify.com"
                autoComplete="off"
              />
              {state.errors?.shop && (
                <FieldError>{state.errors.shop[0]}</FieldError>
              )}
            </Field>
            <Field
              data-invalid={!!state.errors?.clientId?.length}
              data-disabled={isPending}
            >
              <FieldLabel htmlFor="clientId">Client ID</FieldLabel>
              <Input
                id="clientId"
                name="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={isPending}
                aria-invalid={!!state.errors?.clientId?.length}
                placeholder="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                autoComplete="off"
              />
              {state.errors?.clientId && (
                <FieldError>{state.errors.clientId[0]}</FieldError>
              )}
            </Field>
            <Field
              data-invalid={!!state.errors?.clientSecret?.length}
              data-disabled={isPending}
            >
              <FieldLabel htmlFor="clientSecret">Client Secret</FieldLabel>
              <Input
                id="clientSecret"
                name="clientSecret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                disabled={isPending}
                aria-invalid={!!state.errors?.clientSecret?.length}
                placeholder="shpss_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                autoComplete="off"
              />
              {state.errors?.clientSecret && (
                <FieldError>{state.errors.clientSecret[0]}</FieldError>
              )}
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={isPending}
            form="shopify-credentials-form"
          >
            {isPending && <Spinner />}
            Connect Shop
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
