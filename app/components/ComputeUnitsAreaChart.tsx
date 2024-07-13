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
  ChartTooltipContent,
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
  timestamp: Date;
  value: number;
}

const chartConfig = {
  computeUnits: {
    label: "Compute Units",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export function ComputeUnitsAreaChart() {
  const [timeRange, setTimeRange] = React.useState("all");
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
          startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "all":
        default:
          startTime = new Date(0); // Fetch all data
          break;
      }

      const data = await getComputeUnitsUsedTimeSeries(startTime, endTime);
      setChartData(data);
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [timeRange]);

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
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all" className="rounded-lg">
              All time
            </SelectItem>
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
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
              formatter={(value: number) => [
                `${value.toLocaleString()} CU`,
                "Compute Units",
              ]}
              labelFormatter={(label: string) => {
                return new Date(label).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                });
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
