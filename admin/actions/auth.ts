"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function signUpAction() {
  try {
    await auth.api.signUpEmail({
      body: {
        email: "email@domain.com", // required
        name: "Admin User", // required
        password: "$8~qf9EV46Lf+o+", // required
        username: "admin1",
        displayUsername: "Admin User",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during sign-up:", error.message);
    }
    throw new Error("Sign-up failed");
  }
}

export async function signInAction(formData: FormData) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    await auth.api.signInUsername({
      body: {
        username: username, // required
        password: password, // required
      },
    });
    revalidatePath("/sign-in");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during sign-in:", error.message);
    }
    throw new Error("Sign-in failed");
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during sign-out:", error.message);
    }
    throw new Error("Sign-out failed");
  }
}
