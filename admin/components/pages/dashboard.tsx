"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { sidebarData } from "@/data/sidebar";
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  return (
    <SidebarInset>
      <header className="flex h-14 shrink-0 items-center gap-2">
        <div className="flex flex-1 items-center gap-2 px-3">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="line-clamp-1">
                  Dashboard
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 px-4 py-10">
        {sidebarData.favorites.map((item) => (
          <Card
            key={item.name}
            className="p-4 max-w-xl hover:cursor-pointer hover:shadow-md"
            onClick={() => {
              router.push(item.url);
            }}
          >
            <CardHeader>
              <div className="flex gap-2 items-center">
                <div>{item.emoji}</div>
                <span className="text-xl font-bold">{item.name}</span>
              </div>
            </CardHeader>
            <CardContent>{item.description}</CardContent>
            <CardFooter></CardFooter>
          </Card>
        ))}
      </div>
    </SidebarInset>
  );
}
