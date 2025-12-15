import { LoadingComponent } from "@/components/pages/loading";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { sidebarData } from "@/data/sidebar";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { Suspense } from "react";

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
    <QueryProvider>
      <SidebarProvider>
        <AppSidebar user={session.user} sidebarData={sidebarData} />
        <Suspense fallback={<LoadingComponent />}>{children}</Suspense>
      </SidebarProvider>
    </QueryProvider>
  );
}
