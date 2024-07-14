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
  ChartTooltip,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getComputeUnitsUsedTimeSeries } from "../../lib/database";

interface TimeSeriesDataPoint {
  timestamp: Date | string;
  value: number;
}

const chartConfig = {
  computeUnits: {
    label: "Compute Units",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function ComputeUnitsAreaChart() {
  const [timeRange, setTimeRange] = React.useState("24h");
  const [chartData, setChartData] = React.useState<TimeSeriesDataPoint[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const endTime = new Date();
      let startTime: Date;

      switch (timeRange) {
        case "1h":
          startTime = new Date(endTime.getTime() - 60 * 60 * 1000);
          break;
        case "24h":
        default:
          startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
          break;
      }

      try {
        const data = await getComputeUnitsUsedTimeSeries(startTime, endTime);
        setChartData(data.filter((point) => point.timestamp !== null));
      } catch (error) {
        console.error("Error fetching compute units data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [timeRange]);

  const formatTimestamp = (timestamp: Date | string | null) => {
    if (!timestamp) return "N/A";
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Compute Units Used</CardTitle>
          <CardDescription>
            Showing compute units used over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select time range"
          >
            <SelectValue placeholder="Last 24 hours" />
          </SelectTrigger>
          <SelectContent className="">
            <SelectItem value="24h" className="rounded-lg">
              Last 24 hours
            </SelectItem>
            <SelectItem value="1h" className="rounded-lg">
              Last 1 hour
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillComputeUnits" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-computeUnits)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-computeUnits)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => formatTimestamp(value)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Time
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {formatTimestamp(data.timestamp)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Compute Units
                          </span>
                          <span className="font-bold">
                            {data.value.toLocaleString()} CU
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              dataKey="value"
              type="monotone"
              fill="url(#fillComputeUnits)"
              stroke="var(--color-computeUnits)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
