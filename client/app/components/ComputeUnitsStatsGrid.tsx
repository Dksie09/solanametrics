"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRecentDataFromAppwrite } from "../../lib/database";
import { BlockchainStats } from "../../types/BlockchainStats";

function calculateVariance(numbers: number[], mean: number): number {
  return (
    numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) /
    numbers.length
  );
}

function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return Math.round(value / 1_000_000_000) + "B";
  } else if (value >= 1_000_000) {
    return Math.round(value / 1_000_000) + "M";
  } else if (value >= 1000) {
    return Math.round(value / 1000) + "K";
  }
  return Math.round(value).toString();
}

function StatCard({
  title,
  value,
  isLarge = false,
}: {
  title: string;
  value: number;
  isLarge?: boolean;
}) {
  const [textSize, setTextSize] = useState("text-xl");

  useEffect(() => {
    const handleResize = () => {
      const formattedValue = formatNumber(value);
      const width = window.innerWidth;
      let size;

      if (isLarge) {
        if (width >= 1280) size = "text-4xl";
        else if (width >= 1024) size = "text-3xl";
        else if (width >= 768) size = "text-2xl";
        else size = "text-xl";
      } else {
        if (width >= 1280) size = "text-3xl";
        else if (width >= 1024) size = "text-2xl";
        else size = "text-xl";
      }

      // Further reduce size if the number is long
      if (formattedValue.length > 8) {
        size = size
          .replace("xl", "lg")
          .replace("2xl", "xl")
          .replace("3xl", "2xl")
          .replace("4xl", "3xl");
      }

      setTextSize(size);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [value, isLarge]);

  return (
    <Card className="flex flex-col h-40 p-0 sm:p-2">
      <CardHeader className="pb-0">
        <CardDescription className="font-medium">{title}</CardDescription>
      </CardHeader>
      <div className="flex-grow p-2 flex items-center justify-center">
        <div className={`${textSize} font-bold truncate`}>
          {formatNumber(value)}
        </div>
      </div>
    </Card>
  );
}

export function ComputeUnitsStatsGrid() {
  const [stats, setStats] = useState<{
    min: number;
    max: number;
    mean: number;
    median: number;
    variance: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const recentData: BlockchainStats[] = await getRecentDataFromAppwrite(
          1
        );

        if (recentData.length > 0) {
          const latestStats = recentData[0];
          setStats(latestStats.computeUnitStats);
        } else {
          console.error("No data returned from Appwrite");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => clearInterval(intervalId);
  }, []);

  if (!stats) {
    return (
      <div className="h-full flex items-center justify-center">Loading...</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">Compute Units Statistics</h2>
      <div className="flex-grow flex flex-col">
        <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
          <StatCard title="Min" value={stats.min} isLarge={true} />
          <StatCard title="Max" value={stats.max} isLarge={true} />
        </div>
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Mean" value={stats.mean} />
          <StatCard title="Median" value={stats.median} />
          <StatCard title="Variance" value={stats.variance} />
        </div>
      </div>
    </div>
  );
}
