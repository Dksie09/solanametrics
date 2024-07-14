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
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getVoteTxPerMinuteTimeSeries,
  getNonVoteTransactionRateTimeSeries,
} from "../../lib/database";

interface TimeSeriesDataPoint {
  timestamp: Date | string;
  vote: number;
  nonVote: number;
}

const chartConfig = {
  transactions: {
    label: "Transactions",
  },
  vote: {
    label: "Vote",
    color: "hsl(var(--chart-1))",
  },
  nonVote: {
    label: "Non-Vote",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function VoteNonVoteAreaChart() {
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
        const [voteData, nonVoteData] = await Promise.all([
          getVoteTxPerMinuteTimeSeries(startTime, endTime),
          getNonVoteTransactionRateTimeSeries(startTime, endTime),
        ]);

        const processData = (
          data: { timestamp: Date | string; value: number }[]
        ) => {
          let lastNonZeroValue = 0;
          let sumNonZero = 0;
          let countNonZero = 0;

          // First pass: calculate average non-zero value and find last non-zero value
          data.forEach((point) => {
            if (point.value > 0) {
              sumNonZero += point.value;
              countNonZero++;
              lastNonZeroValue = point.value;
            }
          });

          const avgNonZero = countNonZero > 0 ? sumNonZero / countNonZero : 1; // Use 1 as fallback
          const threshold = avgNonZero * 3; // Lower threshold for spike detection

          // Second pass: process data
          return data.map((point) => {
            if (point.value <= 0) {
              // Replace zero or negative with a small positive value
              return Math.max(avgNonZero * 0.1, lastNonZeroValue * 0.1);
            } else if (point.value > threshold) {
              // More aggressive spike normalization
              return Math.min(point.value, avgNonZero * 1.5);
            } else {
              lastNonZeroValue = point.value;
              return point.value;
            }
          });
        };

        const processedVoteData = processData(voteData);
        const processedNonVoteData = processData(nonVoteData);

        const mergedData: TimeSeriesDataPoint[] = voteData.map(
          (votePoint, index) => ({
            timestamp: votePoint.timestamp,
            vote: processedVoteData[index],
            nonVote: processedNonVoteData[index],
          })
        );

        setChartData(mergedData);
      } catch (error) {
        console.error("Error fetching vote/non-vote data:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3 * 60 * 1000); // Update every 3 minutes
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
    <Card className="w-full lg:w-2/3">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Vote vs Non-Vote Transaction Rate Per Minute</CardTitle>
          <CardDescription>
            Comparing vote and non-vote transaction rates per min over time
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
              <linearGradient id="fillVote" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-vote)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-vote)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillNonVote" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-nonVote)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-nonVote)"
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
                        <div className="grid grid-cols-2">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Vote
                          </span>
                          <span className="font-bold">
                            {data.vote.toFixed(2)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-[0.70rem] uppercase text-muted-foreground">
                            Non-Vote
                          </span>
                          <span className="font-bold">
                            {data.nonVote.toFixed(2)}
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
              dataKey="nonVote"
              type="monotone"
              fill="url(#fillNonVote)"
              stroke="var(--color-nonVote)"
              stackId="1"
            />
            <Area
              dataKey="vote"
              type="monotone"
              fill="url(#fillVote)"
              stroke="var(--color-vote)"
              stackId="1"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
