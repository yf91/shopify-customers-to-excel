"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

// export async function signUpAction() {
//   try {
//     await auth.api.signUpEmail({
//       body: {
//         email: "user@domain.com", // required
//         name: "Shopify User", // required
//         password: "53+4v5pR*hJ6hJZ)", // required
//         username: "shopifyUser",
//         displayUsername: "Shopify User",
//       },
//     });
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("Error during sign-up:", error.message);
//     }
//     throw new Error("Sign-up failed");
//   }
// }

export async function signInAction(
  prevState: SignInActionStateType,
  formData: FormData
) {
  try {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    await auth.api.signInUsername({
      body: {
        username: username, // required
        password: password, // required
      },
    });
    // return { success: true, message: "Sign-in successful" };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error during sign-in:", error.message);
    }
    return {
      success: false,
      message: "Sign-in failed",
    };
  }

  return redirect("/dashboard");
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

  return redirect("/sign-in");
}
