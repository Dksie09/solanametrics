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
import { getTpsTimeSeries } from "../../lib/database";

interface TimeSeriesDataPoint {
  timestamp: Date | string;
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

export function TPSChart() {
  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("all");
  const [chartData, setChartData] = React.useState<{
    all: TimeSeriesDataPoint[];
    "24h": TimeSeriesDataPoint[];
  }>({ all: [], "24h": [] });
  const [lastUpdate, setLastUpdate] = React.useState(new Date());

  const fetchData = React.useCallback(async () => {
    const endTime = new Date();
    const start24h = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    const startAll = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000); // Fetch last 30 days

    console.log(
      `Fetching data from ${startAll.toISOString()} to ${endTime.toISOString()}`
    );

    try {
      const [data24h, dataAll] = await Promise.all([
        getTpsTimeSeries(start24h, endTime),
        getTpsTimeSeries(startAll, endTime),
      ]);

      console.log(
        `Received ${data24h.length} data points for 24h and ${dataAll.length} for all time`
      );

      const filteredData24h = data24h.filter(
        (point) => point.timestamp !== null
      );
      const filteredDataAll = dataAll.filter(
        (point) => point.timestamp !== null
      );

      console.log(
        `24h data range: ${filteredData24h[0]?.timestamp} to ${
          filteredData24h[filteredData24h.length - 1]?.timestamp
        }`
      );
      console.log(
        `All data range: ${filteredDataAll[0]?.timestamp} to ${
          filteredDataAll[filteredDataAll.length - 1]?.timestamp
        }`
      );

      setChartData({
        all: filteredDataAll,
        "24h": filteredData24h,
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Error fetching TPS data:", error);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60 * 1000); // Update every minute
    return () => clearInterval(interval);
  }, [fetchData]);

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
          <CardTitle className="text-lg">Transactions Per Second</CardTitle>
          <CardDescription>over time</CardDescription>
          <CardDescription>
            Last updated: {formatTimestamp(lastUpdate)}
          </CardDescription>
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
                <CardDescription className="leading-none">
                  {chartConfig[key].label}
                </CardDescription>
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
                            TPS
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
