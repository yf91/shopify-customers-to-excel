"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { deleteShopAction, fetchShopsAction } from "@/actions/shopify";
import { Spinner } from "./ui/spinner";
import { useEffect, useEffectEvent, useState } from "react";
import { toast } from "sonner";
import { ConnectShopDrawer } from "./connect-shop-drawer";
import { EllipsisIcon } from "lucide-react";
import { ExportCustomersDialog } from "./export-customers-dialog";
import { Shop } from "@/prisma/generated/client";

export function ShopsTable({ userId }: { userId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["shops_data", userId],
    enabled: false,
    queryFn: () => fetchShopsAction(userId),
  });

  const intitalFetchShops = useEffectEvent(() => {
    refetch();
  });

  useEffect(() => {
    intitalFetchShops();
    console.log("Fetching shops...");
  }, []);

  useEffect(() => {
    if (error) {
      toast.error("Error fetching shops: " + (error as Error).message);
    }
  }, [error]);

  async function openExportCustomersDialog(shop: Shop) {
    setSelectedShop(shop);
    setDialogOpen(true);
  }

  async function deleteShop(shop: Shop) {
    try {
      await deleteShopAction(userId, shop.shop);
      toast.success("Shop deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete shop: " + (error as Error).message);
      console.error(error);
    }
  }

  return (
    <>
      {isPending ? (
        <Spinner />
      ) : (
        <Table className="border border-amber-400 rounded-md overflow-hidden">
          <TableHeader className="bg-amber-400">
            <TableRow>
              <TableHead>Shop</TableHead>
              <TableHead className="text-right font-extrabold">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data ? (
              data.map((shop) => (
                <TableRow key={shop.shop}>
                  <TableCell>{shop.shop}</TableCell>
                  <TableCell className="text-right flex gap-2 justify-end">
                    <ShopDropdownMenu
                      openExportCustomersDialogFn={() =>
                        openExportCustomersDialog(shop)
                      }
                      deleteShopFn={() => deleteShop(shop)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2}>No shops found</TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            {!!selectedShop && (
              <ExportCustomersDialog
                open={dialogOpen}
                setOpen={setDialogOpen}
                shop={selectedShop!}
              />
            )}
            <TableRow>
              <TableCell colSpan={1}>
                <ConnectShopDrawer />
              </TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      )}
    </>
  );
}

function ShopDropdownMenu({
  openExportCustomersDialogFn,
  deleteShopFn,
}: {
  openExportCustomersDialogFn: () => Promise<void>;
  deleteShopFn: () => Promise<void>;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">
          <EllipsisIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={openExportCustomersDialogFn}>
            Export Customers
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={deleteShopFn}>
            Delete Shop
          </DropdownMenuItem>
          {/* <DeleteShopMenuItem userId={userId} shop={shop} refetch={refetch} /> */}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ExportCustomersMenuItem() {
  return <DropdownMenuItem>Export Customers</DropdownMenuItem>;
}

export function DeleteShopMenuItem({
  userId,
  shop,
  refetch,
}: {
  userId: string;
  shop: string;
  refetch: () => void;
}) {
  async function handleDelete() {
    try {
      await deleteShopAction(userId, shop);
      toast.success("Shop deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete shop: " + (error as Error).message);
      console.error(error);
    }
  }
  return (
    <DropdownMenuItem
      onClick={(e) => {
        e.preventDefault();
        handleDelete();
      }}
    >
      Delete Shop
    </DropdownMenuItem>
  );
}
