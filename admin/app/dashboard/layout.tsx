import type { Metadata } from "next";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { sidebarData } from "@/data/sidebar";

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
    <SidebarProvider>
      <AppSidebar user={session.user} sidebarData={sidebarData} />
      {children}
    </SidebarProvider>
  );
}
