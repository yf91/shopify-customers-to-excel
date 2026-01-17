"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CreateAppSection() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>1. Create Shopify App</CardTitle>
        <CardDescription>
          Create a private app in your Shopify Dev Dashboard (
          <Link
            href="https://dev.shopify.com/dashboard/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Shopify Developer Dashboard
          </Link>
          ) with the following configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-start">
        <span className="font-bold text-yellow-400">App Name:</span>
        <span>Supportify</span>

        <span className="font-bold text-yellow-400">App URL*:</span>
        <span className="flex items-center gap-2">
          {process.env.NEXT_PUBLIC_APP_URL!}
          <Copy
            onClick={() => {
              window.navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_APP_URL!}`
              );
              toast.success("App URL copied to clipboard");
            }}
          />
        </span>
        <span className="font-bold text-yellow-400">Scopes*:</span>
        <span className="flex items-center gap-2">
          {process.env.NEXT_PUBLIC_APP_SCOPES!}
          <Copy
            onClick={() => {
              window.navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_APP_SCOPES!}`
              );
              toast.success("Scopes copied to clipboard");
            }}
          />
        </span>
        <span className="font-bold text-yellow-400">Redirect URLs*:</span>
        <span className="flex items-center gap-2">
          {process.env.NEXT_PUBLIC_APP_URL!}/api/auth/callback
          <Copy
            onClick={() => {
              window.navigator.clipboard.writeText(
                `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`
              );
              toast.success("Redirect URI copied to clipboard");
            }}
          />
        </span>
      </CardContent>
    </Card>
  );
}
