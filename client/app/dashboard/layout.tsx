import { LoadingComponent } from "@/components/loading";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
        <AppSidebar user={session.user} />
        <Suspense fallback={<LoadingComponent />}>{children}</Suspense>
      </SidebarProvider>
    </QueryProvider>
  );
}
