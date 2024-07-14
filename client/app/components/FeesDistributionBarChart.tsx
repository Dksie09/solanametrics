"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

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
import { getRecentDataFromAppwrite } from "../../lib/database";
import { BlockchainStats } from "../../types/BlockchainStats";

const chartConfig = {
  fees: {
    label: "Transaction Fees",
    color: "hsl(var(--chart-10))",
  },
} satisfies ChartConfig;

interface FeeDistribution {
  range: string;
  count: number;
}

export function FeesDistributionChart() {
  const [chartData, setChartData] = React.useState<FeeDistribution[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const recentData = await getRecentDataFromAppwrite(1000); // Fetch last 1000 data points for better distribution

      // Calculate min and max fees
      const fees = recentData.map(
        (data: BlockchainStats) => data.feeStats.mean
      );
      const minFee = Math.min(...fees);
      const maxFee = Math.max(...fees);

      // Define the number of ranges you want
      const numberOfRanges = 50;
      const rangeSize = Math.ceil((maxFee - minFee) / numberOfRanges);

      // Initialize the distribution object dynamically
      const distribution: { [key: string]: number } = {};
      for (let i = 0; i < numberOfRanges; i++) {
        const rangeStart = minFee + i * rangeSize;
        const rangeEnd = rangeStart + rangeSize;
        distribution[
          `${Math.floor(rangeStart / 1000)}k-${Math.floor(rangeEnd / 1000)}k`
        ] = 0;
      }
      distribution[`${Math.floor(maxFee / 1000)}k+`] = 0;

      // Fill the distribution based on the data
      recentData.forEach((data: BlockchainStats) => {
        const fee = data.feeStats.mean;
        if (fee >= maxFee) {
          distribution[`${Math.floor(maxFee / 1000)}k+`]++;
        } else {
          const index = Math.floor((fee - minFee) / rangeSize);
          const rangeStart = minFee + index * rangeSize;
          const rangeEnd = rangeStart + rangeSize;
          distribution[
            `${Math.floor(rangeStart / 1000)}k-${Math.floor(rangeEnd / 1000)}k`
          ]++;
        }
      });

      const formattedData = Object.entries(distribution)
        .map(([range, count]) => ({
          range,
          count,
        }))
        .filter((item) => item.count > 0); // Remove ranges with zero count

      setChartData(formattedData);
    };

    fetchData();
  }, []);

  return (
    <Card className="pt-3">
      <CardHeader>
        <CardTitle>Distribution of Fees per Transaction</CardTitle>
        <CardDescription>
          Based on the last 1000 data points (Fees in Lamports)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 60,
              bottom: 50,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              label={{
                value: "Fee Range (Lamports)",
                position: "insideBottom",
                offset: -10,
              }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
            />
            <YAxis
              label={{
                value: "Number of Transactions",
                angle: -90,
                position: "insideLeft",
                offset: -40,
              }}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  className="w-[200px]"
                  nameKey="fees"
                  labelFormatter={(value) => `${value} Lamports`}
                />
              }
            />
            <Bar
              dataKey="count"
              fill={chartConfig.fees.color}
              name="Number of Transactions"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
