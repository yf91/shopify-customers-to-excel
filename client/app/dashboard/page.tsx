import { Dashboard } from "@/components/dashboard";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/sign-in");
  }

  return <Dashboard userId={session.user.id} />;
}
