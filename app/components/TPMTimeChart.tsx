"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
import { getTpmTimeSeries } from "../../lib/database";

interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
}

const chartConfig = {
  all: {
    label: "All transactions",
    color: "hsl(var(--chart-1))",
  },
  "24h": {
    label: "Past 24 hours",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function TPMChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("all");
  const [chartData, setChartData] = React.useState<{
    all: TimeSeriesDataPoint[];
    "24h": TimeSeriesDataPoint[];
  }>({ all: [], "24h": [] });
  React.useEffect(() => {
    const fetchData = async () => {
      const endTime = new Date();
      const start24h = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
      const startAll = new Date(0); // Beginning of time

      const data24h = await getTpmTimeSeries(start24h, endTime);
      const dataAll = await getTpmTimeSeries(startAll, endTime);

      setChartData({ all: dataAll, "24h": data24h });
    };

    fetchData();
    // TODO: 5 * 60 * 1000
    const interval = setInterval(fetchData, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const total = React.useMemo(
    () => ({
      all: chartData["all"].reduce((acc, curr) => acc + curr.value, 0),
      "24h": chartData["24h"].reduce((acc, curr) => acc + curr.value, 0),
    }),
    [chartData]
  );

  return (
    <Card className="!border-black">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle className="text-lg">Transactions Per Minute</CardTitle>
          <CardDescription>over time</CardDescription>
        </div>
        <div className="flex">
          {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(
            (key) => (
              <button
                key={key}
                data-active={activeChart === key}
                className="flex flex-1 flex-col justify-center gap-1 h-20 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(key)}
              >
                <span className="leading-none">{chartConfig[key].label}</span>
              </button>
            )
          )}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={chartData[activeChart]}
            margin={{
              left: 12,
              right: 12,
            }}
          >
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
                  minute: "numeric",
                });
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="TPM"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    });
                  }}
                />
              }
            />
            <Line
              dataKey="value"
              type="monotone"
              stroke={`var(--color-${activeChart})`}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
