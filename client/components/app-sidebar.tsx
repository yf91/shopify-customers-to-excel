"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useRouter } from "next/navigation";
import { NavUser } from "./nav-user";

export function AppSidebar({
  user,
  ...props
}: {
  user: {
    email: string;
    name: string;
    image?: string | null | undefined;
    username?: string | null | undefined;
    displayUsername?: string | null | undefined;
  };
} & React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  return (
    <Sidebar className="border-r-0" {...props} variant="floating">
      <SidebarHeader>
        <div
          className="flex justify-center hover:cursor-pointer"
          onClick={() => {
            router.push("/dashboard");
          }}
        ></div>
      </SidebarHeader>
      <SidebarContent className="p-4"></SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
