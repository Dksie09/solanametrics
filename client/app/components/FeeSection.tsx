"use client";
import React, { useEffect, useState } from "react";
import { FeesDistributionChart } from "./FeesDistributionBarChart";
import { MinFeeCard } from "./MinFeeCard";
import { MaxFeeCard } from "./MaxFeeCard";
import { MeanFeeCard } from "./MeanFeeCard";
import { MedianFeeCard } from "./MedianFeeCard";
import { getRecentDataFromAppwrite } from "../../lib/database";
import { FeesCollectedAreaChart } from "./FeesCollectedAreaChart";
import { VarianceFeeCard } from "./VarianceFeeCard";
import { BlockchainStats } from "../../types/BlockchainStats";

interface FeeStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  variance: number;
}

export function FeesSection() {
  const [feeStats, setFeeStats] = useState<FeeStats | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data: BlockchainStats[] = await getRecentDataFromAppwrite(1);
        if (data.length > 0) {
          const latestStats = data[0]; // Get the first (most recent) item
          setFeeStats(latestStats.feeStats);
        } else {
          console.error("No data returned from Appwrite");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }

    // Fetch data immediately
    fetchData();

    // Set up interval to fetch data every minute
    const intervalId = setInterval(fetchData, 60000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
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
          <VarianceFeeCard varianceFee={feeStats.variance} />
        </div>
      </div>
      <div className="mt-5">
        <FeesCollectedAreaChart />
      </div>
    </div>
  );
}
