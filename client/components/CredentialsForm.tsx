"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Spinner } from "./ui/spinner";
import { ShopifyCustomer } from "@/types/shopify";
import { Download } from "lucide-react";
import { shopifyFormSchema } from "@/schemas/shopify";
import { Progress } from "./ui/progress";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import JSZip from "jszip";

export function CredentalsForm() {
  // console.log("Rendering CredentialsForm");
  const [shop, setShop] = useState(
    process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN ?? ""
  );
  const [apiKey, setApiKey] = useState(
    process.env.NEXT_PUBLIC_SHOPIFY_API_KEY ?? ""
  );
  const [customers, setCustomers] = useState<ShopifyCustomer[]>([]);
  const [customerCount, setCustomerCount] = useState<number>(0);
  const [errors, setErrors] = useState<{ shop?: string[]; apiKey?: string[] }>(
    {}
  );
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

  async function fetchCustomerCountPage(
    shop: string,
    apiKey: string
  ): Promise<number> {
    const res = await fetch("/api/shopify/customer-count", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shop,
        apiKey,
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

  async function fetchCustomersPage(
    shop: string,
    apiKey: string,
    cursor?: string
  ): Promise<{
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
        shop,
        apiKey,
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

  const handleFetchCustomers = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = shopifyFormSchema.safeParse({ shop, apiKey });
    if (!result.success) {
      setErrors(result.error.flatten().fieldErrors);
      toast.error("Please fix the form errors");
      return;
    }

    setFetching(true);
    setCustomers([]);

    try {
      console.time("fetchCustomers");
      const customerCount = await fetchCustomerCountPage(shop, apiKey);
      setCustomerCount(customerCount);
      let allCustomers: ShopifyCustomer[] = [];
      let cursor: string | undefined = undefined;
      let hasNextPage = true;

      while (hasNextPage) {
        const {
          customers: pageCustomers,
          hasNextPage: next,
          lastCursor,
        } = await fetchCustomersPage(shop, apiKey, cursor);
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
  };

  const exportCustomers = async () => {
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
  };

  return (
    <div className="flex flex-col gap-2 items-center mt-5">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Shopify Customer To Excel List 1.4</CardTitle>
          <CardDescription>
            Download your Shopify store customers by providing your Shop URL and
            API Key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFetchCustomers} id="shopify-credentials-form">
            <FieldGroup>
              <Field
                data-invalid={!!errors?.shop?.length}
                data-disabled={fetching}
              >
                <FieldLabel htmlFor="shop">Shop</FieldLabel>
                <Input
                  id="shop"
                  name="shop"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                  disabled={fetching}
                  aria-invalid={!!errors?.shop?.length}
                  placeholder="your-shop.myshopify.com"
                  autoComplete="off"
                />
                {errors?.shop && <FieldError>{errors.shop[0]}</FieldError>}
              </Field>
              <Field
                data-invalid={!!errors?.apiKey?.length}
                data-disabled={fetching}
              >
                <FieldLabel htmlFor="apiKey">API Key</FieldLabel>
                <Input
                  id="apiKey"
                  name="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={fetching}
                  aria-invalid={!!errors?.apiKey?.length}
                  placeholder="shpat_7796977fd423s345shd3445"
                  autoComplete="off"
                />
                {errors?.apiKey && <FieldError>{errors.apiKey[0]}</FieldError>}
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter>
          <Field orientation="horizontal">
            <Button
              type="submit"
              disabled={fetching}
              form="shopify-credentials-form"
            >
              {fetching && <Spinner />}
              Fetch Customers
            </Button>
          </Field>
          {customerCount > 0 && (
            <div className="flex flex-col items-center justify-center w-full gap-2">
              <span className="text-sm text-gray-500">
                {((customers.length / customerCount) * 100).toFixed(2)} %
              </span>
              <Progress
                value={(customers.length / customerCount) * 100}
                className="w-full"
              />
            </div>
          )}
        </CardFooter>
      </Card>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription className="flex flex-col gap-3 justify-between">
            <span>
              <span className="font-bold"> {customers.length} </span>
              customers were found in your Shopify store.
            </span>
            <div className="flex items-start gap-2">
              <Checkbox
                id="split-customers"
                disabled={customers.length === 0 || processDownload}
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
              disabled={customers.length === 0 || processDownload}
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
          </CardDescription>
          <CardContent></CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
