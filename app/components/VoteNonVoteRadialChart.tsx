"use client";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  getVoteTxPerMinuteTimeSeries,
  getNonVoteTransactionRateTimeSeries,
} from "../../lib/database";
import React from "react";

const chartConfig = {
  vote: {
    label: "Vote Transactions",
    color: "hsl(var(--chart-1))",
  },
  nonVote: {
    label: "Non-Vote Transactions",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function VoteNonVoteRadialChart() {
  const [chartData, setChartData] = React.useState<{
    vote: number;
    nonVote: number;
  }>({ vote: 0, nonVote: 0 });
  const [trend, setTrend] = React.useState<{
    percentage: number;
    isUp: boolean;
  }>({ percentage: 0, isUp: true });

  React.useEffect(() => {
    const fetchData = async () => {
      const endTime = new Date();
      const startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

      const [voteData, nonVoteData] = await Promise.all([
        getVoteTxPerMinuteTimeSeries(startTime, endTime),
        getNonVoteTransactionRateTimeSeries(startTime, endTime),
      ]);

      const totalVote = voteData.reduce((sum, point) => sum + point.value, 0);
      const totalNonVote = nonVoteData.reduce(
        (sum, point) => sum + point.value,
        0
      );

      setChartData({ vote: totalVote, nonVote: totalNonVote });

      // Calculate trend (example: comparing to previous 24 hours)
      const previousStartTime = new Date(
        startTime.getTime() - 24 * 60 * 60 * 1000
      );
      const [prevVoteData, prevNonVoteData] = await Promise.all([
        getVoteTxPerMinuteTimeSeries(previousStartTime, startTime),
        getNonVoteTransactionRateTimeSeries(previousStartTime, startTime),
      ]);

      const prevTotal =
        prevVoteData.reduce((sum, point) => sum + point.value, 0) +
        prevNonVoteData.reduce((sum, point) => sum + point.value, 0);
      const currentTotal = totalVote + totalNonVote;

      const trendPercentage = ((currentTotal - prevTotal) / prevTotal) * 100;
      setTrend({
        percentage: Math.abs(trendPercentage),
        isUp: trendPercentage >= 0,
      });
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const totalTransactions = chartData.vote + chartData.nonVote;

  return (
    <Card className="flex flex-col w-full lg:w-1/3">
      <CardHeader className="items-center">
        <CardTitle className="text-xl text-center">
          Non-Vote vs Vote Transactions
        </CardTitle>
        <CardDescription>Last 24 Hours</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[250px]"
        >
          <RadialBarChart
            data={[chartData]}
            endAngle={360}
            innerRadius={100}
            outerRadius={150}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy || 0}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {Math.floor(
                            totalTransactions / 1000
                          ).toLocaleString()}
                          k
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 16}
                          className="fill-muted-foreground"
                        >
                          Transactions
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
            <RadialBar
              dataKey="vote"
              stackId="a"
              cornerRadius={5}
              fill="var(--color-vote)"
              className="stroke-transparent stroke-2"
            />
            <RadialBar
              dataKey="nonVote"
              fill="var(--color-nonVote)"
              stackId="a"
              cornerRadius={5}
              className="stroke-transparent stroke-2"
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-muted-foreground">
          Total transactions
        </div>
      </CardFooter>
    </Card>
  );
}
