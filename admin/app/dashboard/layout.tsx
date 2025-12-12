import { LoadingComponent } from "@/components/pages/loading";
import GuardComponent from "@/components/pages/guard";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<LoadingComponent />}>
      <GuardComponent>{children}</GuardComponent>
    </Suspense>
  );
}
