"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInAction } from "@/actions/auth";
// import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActionState, useEffect } from "react";
import { Spinner } from "../ui/spinner";
import { SignInActionStateType } from "@/types/auth";

export function SignInForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // const router = useRouter();
  const [state, formAction, isPending] = useActionState(signInAction, {
    success: null,
    message: "",
  } as SignInActionStateType);

  useEffect(() => {
    // if (state.success) {
    //   toast.success(state.message);
    //   router.push("/dashboard");
    // } else if (state.success === false && state.message) {
    //   toast.error(state.message);
    // }
    if (state.success === false && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>
            Enter your username and password below to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input id="username" name="username" type="text" required />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" required />
              </Field>
              <Field>
                <Button type="submit" disabled={isPending}>
                  {isPending ? <Spinner /> : null}
                  Sign in
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
