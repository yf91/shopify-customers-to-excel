"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import JSZip from "jszip";
import { Tooltip } from "../ui/tooltip";

export const description = "An interactive area chart";

const chartConfig = {
  customers: {
    label: "Customers",
  },
  count: {
    label: "Count",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartAreaInteractive({
  data,
  isFetchingStatisticsData,
  fetchCustomerData,
}: {
  data: { count: number; addedAt: string }[];
  isFetchingStatisticsData: boolean;
  fetchCustomerData: () => Promise<CustomerDataType[]>;
}) {
  const excelWorkerRef = useRef<Worker | null>(null);
  const [processDownload, setProcessDownload] = useState(false);

  useEffect(() => {
    excelWorkerRef.current = new Worker("/excel-worker.js");
    excelWorkerRef.current.onmessage = (event: MessageEvent) => {
      if (event.data.status === "SUCCESS") {
        const zip = new JSZip();

        const blob = new Blob([event.data.data.buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        zip.file(`customers.xlsx`, blob);

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
        toast.error(`Error exporting customers: ${event.data.error}`);
        setProcessDownload(false);
      }
    };
    return () => {
      excelWorkerRef.current?.terminate();
    };
  }, []);

  async function downloadCustomerData() {
    setProcessDownload(true);
    if (!excelWorkerRef.current) {
      alert("Worker nicht verfügbar!");
      setProcessDownload(false);
      return;
    }

    const customers = await fetchCustomerData();

    excelWorkerRef.current?.postMessage({
      type: "EXPORT_CUSTOMERS",
      data: {
        customers: customers,
      },
    });
  }

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Shopify Customers</CardTitle>
          <CardDescription>
            Showing the number of customers fetched from Shopify
          </CardDescription>
        </div>
        <div>
          <Button
            variant="outline"
            onClick={async () => {
              await downloadCustomerData();
            }}
            disabled={
              data.length === 0 || isFetchingStatisticsData || processDownload
            }
          >
            {processDownload ? (
              <div className="flex gap-2 items-center justify-center">
                <Spinner /> <span>Exporting</span>
              </div>
            ) : (
              <span>Export Customers</span>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isFetchingStatisticsData ? (
          <Spinner />
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-62.5 w-full"
          >
            <AreaChart
              data={data}
              margin={{ left: 30, right: 30, top: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={true} />
              <XAxis
                dataKey="addedAt"
                tickLine={true}
                axisLine={true}
                tickMargin={10}
                interval={0}
                textAnchor="middle"
                tickFormatter={(value) => {
                  return value.split("T")[0];
                }}
              />
              <ChartTooltip
                cursor={true}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return value.split("T")[0];
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="count"
                type="natural"
                fill="url(#fillCount)"
                stroke="var(--color-count)"
                stackId="a"
              />

              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
