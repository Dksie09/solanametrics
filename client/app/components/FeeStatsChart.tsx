"use client";

import React, { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { getRecentDataFromAppwrite } from "../../lib/database";
import { BlockchainStats } from "../../types/BlockchainStats";

const chartConfig = {
  min: { label: "Min", color: "hsl(var(--chart-1))" },
  max: { label: "Max", color: "hsl(var(--chart-2))" },
  mean: { label: "Mean", color: "hsl(var(--chart-3))" },
  median: { label: "Median", color: "hsl(var(--chart-4))" },
  //   variance: { label: "Variance", color: "hsl(var(--chart-5))" },
};

export function FeeStatsChart() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [trend, setTrend] = useState({ value: 0, isUp: true });

  useEffect(() => {
    const fetchData = async () => {
      const recentData = await getRecentDataFromAppwrite(100); // Fetch last 100 data points

      const processedData = recentData.map((item: BlockchainStats) => ({
        timestamp: item.timestamp,
        min: item.feeStats.min,
        max: item.feeStats.max,
        mean: item.feeStats.mean,
        median: item.feeStats.median,
        // variance: item.feeStats.variance,
      }));

      setChartData(processedData);

      // Calculate trend using mean
      if (processedData.length > 1) {
        const latestMean = processedData[processedData.length - 1].mean;
        const previousMean = processedData[processedData.length - 2].mean;
        const trendValue = ((latestMean - previousMean) / previousMean) * 100;
        setTrend({ value: Math.abs(trendValue), isUp: trendValue > 0 });
      }
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Statistics</CardTitle>
        <CardDescription>Last 100 data points</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend />
              {Object.entries(chartConfig).map(([key, value]) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={value.color}
                  name={value.label}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 font-medium leading-none">
              {trend.isUp ? "Trending up" : "Trending down"} by{" "}
              {trend.value.toFixed(2)}%
              {trend.isUp ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
            </div>
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              Showing fee statistics for the last 100 data points
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
