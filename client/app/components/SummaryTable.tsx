"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRecentDataFromAppwrite } from "../../lib/database";
import { BlockchainStats } from "../../types/BlockchainStats";

interface AveragesData {
  metric: string;
  daily: number;
  weekly: number;
  monthly: number;
}

export function BlockchainAveragesTable() {
  const [averages, setAverages] = useState<AveragesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAverages = async () => {
      setIsLoading(true);
      try {
        // Fetch last 30 days of data
        const recentData = await getRecentDataFromAppwrite(30 * 24 * 60); // Assuming data is stored every minute

        // Calculate averages
        const averages = calculateAverages(recentData);
        setAverages(averages);
      } catch (error) {
        console.error("Error fetching averages:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAverages();
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchAverages, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const calculateAverages = (data: BlockchainStats[]): AveragesData[] => {
    const dailyData = data.slice(0, 24 * 60); // Last 24 hours
    const weeklyData = data.slice(0, 7 * 24 * 60); // Last 7 days
    const monthlyData = data; // All data (up to 30 days)

    const calculateAverage = (arr: number[]) =>
      arr.reduce((a, b) => a + b, 0) / arr.length;

    return [
      {
        metric: "TPS",
        daily: calculateAverage(dailyData.map((d) => d.tps)),
        weekly: calculateAverage(weeklyData.map((d) => d.tps)),
        monthly: calculateAverage(monthlyData.map((d) => d.tps)),
      },
      {
        metric: "TPM",
        daily: calculateAverage(dailyData.map((d) => d.tpm)),
        weekly: calculateAverage(weeklyData.map((d) => d.tpm)),
        monthly: calculateAverage(monthlyData.map((d) => d.tpm)),
      },
      {
        metric: "Block Production Rate",
        daily: calculateAverage(dailyData.map((d) => d.blockProductionRate)),
        weekly: calculateAverage(weeklyData.map((d) => d.blockProductionRate)),
        monthly: calculateAverage(
          monthlyData.map((d) => d.blockProductionRate)
        ),
      },
      {
        metric: "Blocktime",
        daily: calculateAverage(dailyData.map((d) => d.blocktime)),
        weekly: calculateAverage(weeklyData.map((d) => d.blocktime)),
        monthly: calculateAverage(monthlyData.map((d) => d.blocktime)),
      },
      {
        metric: "Vote Transaction Rate",
        daily: calculateAverage(dailyData.map((d) => d.voteTxPerMinute)),
        weekly: calculateAverage(weeklyData.map((d) => d.voteTxPerMinute)),
        monthly: calculateAverage(monthlyData.map((d) => d.voteTxPerMinute)),
      },
      {
        metric: "Non-Vote Transaction Rate",
        daily: calculateAverage(dailyData.map((d) => d.nonVoteTransactionRate)),
        weekly: calculateAverage(
          weeklyData.map((d) => d.nonVoteTransactionRate)
        ),
        monthly: calculateAverage(
          monthlyData.map((d) => d.nonVoteTransactionRate)
        ),
      },
    ];
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className=" w-full lg:w-1/2">
      <CardHeader>
        <CardDescription>
          Daily, Weekly, and Monthly averages of key blockchain metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Daily Average</TableHead>
              <TableHead>Weekly Average</TableHead>
              <TableHead>Monthly Average</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {averages.map((row) => (
              <TableRow key={row.metric}>
                <TableCell className="font-medium">{row.metric}</TableCell>
                <TableCell>{row.daily.toFixed(2)}</TableCell>
                <TableCell>{row.weekly.toFixed(2)}</TableCell>
                <TableCell>{row.monthly.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
