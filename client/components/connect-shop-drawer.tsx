"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { CreateAppSection } from "./create-app-section";
import { ConnectShopSection } from "./connect-shop-section";

export function ConnectShopDrawer() {
  return (
    <Drawer direction="top">
      <DrawerTrigger asChild>
        <Button className="flex items-center justify-center gap-2">
          <Plus />
          <span>Connect Shop</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move Goal</DrawerTitle>
          <DrawerDescription>Set your daily activity goal.</DrawerDescription>
        </DrawerHeader>
        <DrawerContent>
          <div className="flex flex-1 flex-col gap-4 px-4 py-10">
            <CreateAppSection />
            <ConnectShopSection />
          </div>
        </DrawerContent>
      </DrawerContent>
    </Drawer>
  );
}
