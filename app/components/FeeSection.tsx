// components/FeesSection.tsx
"use client";
import React, { useEffect, useState } from "react";
import { FeesDistributionChart } from "./FeesDistributionBarChart";
import { MinFeeCard } from "./MinFeeCard";
import { MaxFeeCard } from "./MaxFeeCard";
import { MeanFeeCard } from "./MeanFeeCard";
import { MedianFeeCard } from "./MedianFeeCard";
import { ModeFeeCard } from "./ModeFeeCard";
import { getRecentDataFromAppwrite } from "../../lib/database";
import { calculateFeeStatistics } from "../../lib/calculateFeeStatistics";
import { FeesCollectedAreaChart } from "./FeesCollectedAreaChart";

interface FeeStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number;
}

export function FeesSection() {
  const [feeStats, setFeeStats] = useState<FeeStats | null>(null);

  useEffect(() => {
    async function fetchData() {
      const data = await getRecentDataFromAppwrite(1000);
      const stats = calculateFeeStatistics(data);
      setFeeStats(stats);
    }
    fetchData();
  }, []);

  if (!feeStats) return <div>Loading...</div>;

  return (
    <div id="fees" className="p-10 mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6">Fees</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4">
          <FeesDistributionChart />
        </div>
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          <MinFeeCard minFee={feeStats.min} />
          <MaxFeeCard maxFee={feeStats.max} />
          <MeanFeeCard meanFee={feeStats.mean} />
          <MedianFeeCard medianFee={feeStats.median} />
          <ModeFeeCard modeFee={feeStats.mode} />
        </div>
      </div>
      <div className="mt-4">
        <FeesCollectedAreaChart />
      </div>
    </div>
  );
}
