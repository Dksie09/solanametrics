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
} from "@/components/ui/chart";
import { getBlockProductionRateTimeSeries } from "../../lib/database";

interface TimeSeriesDataPoint {
  timestamp: Date | string;
  value: number;
}

const chartConfig = {
  all: {
    label: "All time",
    color: "hsl(var(--chart-6))",
  },
  "24h": {
    label: "Past 24 hours",
    color: "hsl(var(--chart-7))",
  },
} satisfies ChartConfig;

export function BlockProductionRateChart() {
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
      const startAll = new Date(0);

      try {
        const data24h = await getBlockProductionRateTimeSeries(
          start24h,
          endTime
        );
        const dataAll = await getBlockProductionRateTimeSeries(
          startAll,
          endTime
        );

        setChartData({
          all: dataAll.filter((point) => point.timestamp !== null),
          "24h": data24h.filter((point) => point.timestamp !== null),
        });
      } catch (error) {
        console.error("Error fetching block production rate data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

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
    <Card className="!border-black">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Block Production</CardTitle>
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
              tickFormatter={(value) => formatTimestamp(value)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.toFixed(2)}
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
                            Block Production Rate
                          </span>
                          <span className="font-bold">
                            {data.value.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
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
