"use client";
import React, { useState, useEffect } from "react";
import { getLatestDataFromAppwrite } from "../../lib/database";
import { BlockchainStats } from "../../types/BlockchainStats";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const statsToDisplay = [
  {
    key: "tps",
    label: "TPS",
    decimals: 2,
    className: "shadow-green-500",
    hoverclassName: "hover:shadow-green-500",
  },
  {
    key: "tpm",
    label: "TPM",
    decimals: 2,
    className: "shadow-pink-500",
    hoverclassName: "hover:shadow-pink-500",
  },
  {
    key: "blockProductionRate",
    label: "Block Production Rate",
    decimals: 2,
    className: "shadow-purple-500",
    hoverclassName: "hover:shadow-purple-500",
  },
  {
    key: "blocktime",
    label: "Blocktime",
    decimals: 4,
    className: "shadow-blue-500",
    hoverclassName: "hover:shadow-blue-500",
  },
];

function Realtime() {
  const [stats, setStats] = useState<BlockchainStats | null>(null);

  const fetchLatestStats = async () => {
    const latestData = await getLatestDataFromAppwrite();
    if (latestData) {
      setStats(latestData);
    }
  };

  useEffect(() => {
    fetchLatestStats();
    const interval = setInterval(fetchLatestStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="flex flex-col space-y-3 mt-10">
        <Skeleton className="h-[125px] w-[250px] " />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg shadow m-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 xxl:grid-cols-4 gap-4">
        {statsToDisplay.map((item) => (
          <Card
            key={item.key}
            className={`p-4 border h-32 min-w-72 rounded-xl flex flex-col items-center shadow-md justify-center ${item.className} hover:shadow-2xl ${item.hoverclassName}`}
          >
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-center justify-center text-3xl">
              {(stats[item.key as keyof BlockchainStats] as number).toFixed(
                item.decimals
              )}
            </CardTitle>
          </Card>
        ))}
      </div>
      <p className="mt-4 text-sm opacity-50">
        Last updated: {stats.timestamp.toLocaleString()}
      </p>
    </div>
  );
}

export default Realtime;
