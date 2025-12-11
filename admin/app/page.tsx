import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession();
  redirect(session ? "/dashboard" : "/sign-in");
}
