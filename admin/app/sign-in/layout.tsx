import type { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "SignIn - Shopify Customer Download",
  description: "Sign in to manage your Shopify store customers",
};

export default async function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
