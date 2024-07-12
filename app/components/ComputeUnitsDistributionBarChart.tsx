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
  computeUnits: {
    label: "Compute Units",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

interface ComputeUnitDistribution {
  range: string;
  count: number;
}

export function ComputeUnitsDistributionChart() {
  const [chartData, setChartData] = React.useState<ComputeUnitDistribution[]>(
    []
  );
  const [maxComputeUnits, setMaxComputeUnits] = React.useState<number>(0);

  React.useEffect(() => {
    const fetchData = async () => {
      const recentData = await getRecentDataFromAppwrite(1000); // Fetch last 1000 data points

      const distribution: { [key: string]: number } = {};
      let max = 0;

      recentData.forEach((data: BlockchainStats) => {
        const computeUnits = data.computeUnitStats.mean;
        max = Math.max(max, computeUnits);
        const index = Math.floor(computeUnits / 1000);
        const key = `${index}k-${index + 1}k`;
        distribution[key] = (distribution[key] || 0) + 1;
      });

      setMaxComputeUnits(max);

      console.log("Max Compute Units:", max);
      console.log("Distribution:", distribution);

      const formattedData = Object.entries(distribution)
        .map(([range, count]) => ({ range, count }))
        .sort((a, b) => parseInt(a.range) - parseInt(b.range));

      setChartData(formattedData);
    };

    fetchData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribution of Compute Units per Transaction</CardTitle>
        <CardDescription>
          Max Compute Units: {maxComputeUnits.toFixed(2)}
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
              left: 40,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="range"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={60}
              label={{
                value: "Compute Units Range",
                position: "insideBottom",
                offset: -40,
              }}
            />
            <YAxis
              label={{
                value: "Number of Transactions",
                angle: -90,
                position: "insideLeft",
                offset: 10,
              }}
            />
            <Tooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="computeUnits"
                  labelFormatter={(value) => `${value} Compute Units`}
                />
              }
            />
            <Bar
              dataKey="count"
              fill={chartConfig.computeUnits.color}
              name="Number of Transactions"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
