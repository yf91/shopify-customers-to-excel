import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export default async function Home() {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  const session = await getServerSession();
  redirect(session ? "/dashboard" : "/sign-in");
}
