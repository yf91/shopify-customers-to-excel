import type { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { signOutAction } from "@/actions/auth";

export const metadata: Metadata = {
  title: "Dashboard - Shopify Customer Download",
  description: "Manage your Shopify store customers",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <>
      <h1>Dashboard</h1>
      <>
        <div>{session.user.username}</div>
        <form action={signOutAction}>
          <button type="submit">Sign Out</button>
        </form>
      </>
      {children}
    </>
  );
}
