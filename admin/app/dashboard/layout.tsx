import GuardComponent from "@/components/pages/guard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <GuardComponent>{children}</GuardComponent>;
}
