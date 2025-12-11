"use client";
import { signInAction } from "@/actions/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignInPage() {
  const router = useRouter();
  async function handleSignIn(formData: FormData) {
    try {
      await signInAction(formData);
      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message ? error.message : "An error occurred");
      }
    }
  }

  return (
    <div>
      <form action={handleSignIn}>
        <input type="text" name="username" placeholder="Username" required />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
