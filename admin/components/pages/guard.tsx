"use server";

import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { sidebarData } from "@/data/sidebar";
import { QueryProvider } from "@/components/providers/query-provider";

export default async function GuardComponent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  console.log("Guard component rendered");

  return (
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar user={session.user} sidebarData={sidebarData} />
        {children}
      </SidebarProvider>
    </QueryProvider>
  );
}
