"use client";

import * as React from "react";
import { NavFavorites } from "@/components/sidebar/nav-favorites";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { useRouter } from "next/navigation";

export function AppSidebar({
  user,
  sidebarData,
  ...props
}: {
  user: {
    email: string;
    name: string;
    image?: string | null | undefined;
    username?: string | null | undefined;
    displayUsername?: string | null | undefined;
  };
  sidebarData: {
    favorites: {
      name: string;
      url: string;
      emoji: string;
    }[];
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
        >
          <span className="text-xl font-bold">💠 Dashboard 1.0</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavFavorites favorites={sidebarData.favorites} />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
