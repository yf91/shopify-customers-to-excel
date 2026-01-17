import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Shop } from "@/prisma/generated/client";
import { toast } from "sonner";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "./ui/spinner";
import { ShopifyCustomer } from "@/types/shopify";
import { Download } from "lucide-react";
import { Progress } from "./ui/progress";
import { Checkbox } from "./ui/checkbox";

import JSZip from "jszip";

export function ExportCustomersDialog({
  open,
  setOpen,
  shop,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  shop: Shop;
}) {
  const [customers, setCustomers] = useState<ShopifyCustomer[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [fetching, setFetching] = useState(false);
  const [customerSplitChecked, setCustomerSplitChecked] = useState(true);
  const excelWorkerRef = useRef<Worker | null>(null);
  const [processDownload, setProcessDownload] = useState(false);

  useEffect(() => {
    excelWorkerRef.current = new Worker("/excel-worker.js");
    excelWorkerRef.current.onmessage = (event: MessageEvent) => {
      if (event.data.status === "SUCCESS") {
        const zip = new JSZip();

        event.data.data.forEach(
          (customerData: {
            country: string;
            count: number;
            buffer: ArrayBuffer;
          }) => {
            const blob = new Blob([customerData.buffer], {
              type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });

            zip.file(
              `customers_${customerData.country}_${customerData.count}.xlsx`,
              blob
            );
          }
        );

        zip.generateAsync({ type: "blob" }).then((zipBlob) => {
          const zipUrl = URL.createObjectURL(zipBlob);
          const a = document.createElement("a");
          a.href = zipUrl;
          a.download = `customers.zip`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(zipUrl);
          toast.success("Zip file created successfully!");
          setProcessDownload(false);
        });
      } else if (event.data.status === "ERROR") {
        toast.error(`Error creating Excel file: ${event.data.error}`);
        setProcessDownload(false);
      }
    };
    return () => {
      excelWorkerRef.current?.terminate();
    };
  }, []);

  async function fetchCustomerCountPage(): Promise<number> {
    const res = await fetch("/api/shopify/customer-count", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shop: shop.shop,
        accessToken: shop.accessToken,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Shopify API error:", errorData);
      throw new Error("Fehler beim Abrufen der Shopify Customer Count");
    }

    const json = await res.json();

    if (json.errors || json.error) {
      console.error("GraphQL errors:", json);
      throw new Error("GraphQL-Fehler beim Abrufen der Customer Count");
    }

    const customerCount = json.data.customersCount.count;

    return customerCount;
  }

  async function fetchCustomersPage(cursor?: string): Promise<{
    customers: ShopifyCustomer[];
    hasNextPage: boolean;
    lastCursor: string | null;
  }> {
    const res = await fetch("/api/shopify/customer-list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shop: shop.shop,
        accessToken: shop.accessToken,
        variables: { cursor: cursor ?? null },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error("Shopify API error:", errorData);
      throw new Error("Fehler beim Abrufen der Shopify Customers");
    }

    const json = await res.json();

    if (json.errors || json.error) {
      console.error("GraphQL errors:", json);
      throw new Error("GraphQL-Fehler beim Abrufen der Customers");
    }

    const edges = json.data.customers.edges as {
      cursor: string;
      node: ShopifyCustomer;
    }[];

    const customers = edges.map((e) => e.node);
    const hasNextPage = json.data.customers.pageInfo.hasNextPage as boolean;
    const lastCursor = edges.length > 0 ? edges[edges.length - 1].cursor : null;

    return { customers, hasNextPage, lastCursor };
  }

  async function handleFetchCustomers() {
    try {
      setFetching(true);
      setCustomers([]);
      console.time("fetchCustomers");
      const customerCount = await fetchCustomerCountPage();
      setCustomerCount(customerCount);
      let allCustomers: ShopifyCustomer[] = [];
      let cursor: string | undefined = undefined;
      let hasNextPage = true;

      while (hasNextPage) {
        const {
          customers: pageCustomers,
          hasNextPage: next,
          lastCursor,
        } = await fetchCustomersPage(cursor);
        allCustomers = allCustomers.concat(pageCustomers);
        setCustomers([...allCustomers]);
        hasNextPage = next;
        cursor = lastCursor ?? undefined;
      }
      // await new Promise((resolve) => setTimeout(resolve, 300000)); // Small delay for better UX
      console.timeEnd("fetchCustomers");

      //setCustomers(allCustomers);
      toast.success("Customers fetched successfully!", {
        description: `We found ${allCustomers.length} customers.`,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error occurred while fetching customers.");
    } finally {
      setFetching(false);
    }
  }

  async function exportCustomers() {
    setProcessDownload(true);
    if (!excelWorkerRef.current) {
      alert("Worker nicht verfügbar!");
      setProcessDownload(false);
      return;
    }

    excelWorkerRef.current?.postMessage({
      type: "EXPORT_CUSTOMERS",
      data: {
        customers: customers,
        country: "All",
        split: customerSplitChecked,
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Customers from {shop.shop}</DialogTitle>
          <DialogDescription>
            Please fetch Customers before exporting.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Button
            disabled={fetching}
            onClick={async () => handleFetchCustomers()}
          >
            {fetching && <Spinner />}
            Fetch Customers
          </Button>
          {customerCount > 0 && (
            <div className="flex flex-col items-center justify-center w-full gap-2">
              <span className="text-sm text-green-500">
                {((customers.length / customerCount) * 100).toFixed(2)} %
              </span>
              <Progress
                value={(customers.length / customerCount) * 100}
                className="w-full"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span>
            <span className="font-bold"> {customers.length} </span>
            customers were found in your Shopify store.
          </span>
          <div className="flex items-start gap-2">
            <Checkbox
              id="split-customers"
              disabled={customers.length === 0 || processDownload || fetching}
              checked={customerSplitChecked}
              onCheckedChange={(value) =>
                setCustomerSplitChecked(value === true)
              }
            />
            <div className="grid gap-2">
              <Label htmlFor="split-customers">
                Split customers by country
              </Label>
            </div>
          </div>
          <Button
            disabled={customers.length === 0 || processDownload || fetching}
            onClick={exportCustomers}
          >
            {processDownload ? (
              <>
                <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Prepare and download...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download Customers
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
