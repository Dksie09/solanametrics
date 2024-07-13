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

function calculateMode(numbers: number[]): number {
  const frequency: { [key: number]: number } = {};
  let maxFreq = 0;
  let mode = numbers[0];

  for (const num of numbers) {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
      mode = num;
    }
  }

  return mode;
}

function formatNumber(value: number, isLarge: boolean): string {
  if (!isLarge && value >= 1000) {
    return (value / 1000).toFixed(1) + "k";
  }
  return value.toFixed(2);
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
  const [formattedValue, setFormattedValue] = useState(
    formatNumber(value, isLarge)
  );

  useEffect(() => {
    const handleResize = () => {
      setFormattedValue(
        formatNumber(value, isLarge || window.innerWidth >= 768)
      );
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [value, isLarge]);

  return (
    <Card className="flex flex-col h-40">
      <CardHeader className="pb-2">
        <CardDescription className="font-medium">{title}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <div
          className={`${
            isLarge
              ? "xl:text-3xl lg:text-2xl md:text-3xl text-xl"
              : "xl:text-xl text-md lg:text-lg md:text-xl"
          } font-bold truncate`}
        >
          {formattedValue}
        </div>
      </CardContent>
    </Card>
  );
}
export function ComputeUnitsStatsGrid() {
  const [stats, setStats] = useState<{
    min: number;
    max: number;
    mean: number;
    median: number;
    mode: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const recentData = await getRecentDataFromAppwrite(100);

      if (recentData.length > 0) {
        const computeUnits = recentData.map((d) => d.computeUnitsPerMinute);

        computeUnits.sort((a, b) => a - b);

        const min = computeUnits[0];
        const max = computeUnits[computeUnits.length - 1];
        const mean =
          computeUnits.reduce((sum, val) => sum + val, 0) / computeUnits.length;
        const median =
          computeUnits.length % 2 === 0
            ? (computeUnits[computeUnits.length / 2 - 1] +
                computeUnits[computeUnits.length / 2]) /
              2
            : computeUnits[Math.floor(computeUnits.length / 2)];
        const mode = calculateMode(computeUnits);

        setStats({ min, max, mean, median, mode });
      }
    };

    fetchData();
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
        <div className="flex-1 grid grid-cols-3 gap-4">
          <StatCard title="Mean" value={stats.mean} />
          <StatCard title="Median" value={stats.median} />
          <StatCard title="Mode" value={stats.mode} />
        </div>
      </div>
    </div>
  );
}
