import React from "react";
import { TPSChart } from "./TPSTimeChart";
import { TPMChart } from "./TPMTimeChart";
import { Card } from "@/components/ui/card";
import { BlockProductionRateChart } from "./BlockProductionRateTimeChart";
import { BlocktimeChart } from "./BlocktimeTimeChart";
import { VoteNonVoteAreaChart } from "./VoteNonVoteTimeChart";
import { VoteNonVoteRadialChart } from "./VoteNonVoteRadialChart";
import { RecentMetricsSummary } from "./RecentMetricsSummaryTable";
import { ComputeUnitsDistributionChart } from "./ComputeUnitsDistributionBarChart";
import { FeesDistributionChart } from "./FeesDistributionBarChart";
import { MaxFeeCard } from "./MaxFeeCard";
import { MeanFeeCard } from "./MeanFeeCard";
import { ModeFeeCard } from "./ModeFeeCard";
import { MedianFeeCard } from "./MedianFeeCard";
import { MinFeeCard } from "./MinFeeCard";
import { FeesSection } from "./FeeSection";
import { ComputeUnitsAreaChart } from "./ComputeUnitsAreaChart";
import { BlockchainAveragesTable } from "./SummaryTable";

function Performance() {
  return (
    <div className="flex flex-col gap-10">
      <div id="transaction" className="p-5 sm:p-8 md:p-10 mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Transactions</h1>
        <RecentMetricsSummary />
        <Card className="container mx-auto shadow-lg grid grid-cols-1 lg:grid-cols-2 p-4 gap-10">
          <TPSChart />
          <TPMChart />
        </Card>
        <div className="flex gap-4 mt-5">
          <VoteNonVoteAreaChart />
          <VoteNonVoteRadialChart />
        </div>
      </div>

      <div id="compute-units" className="p-5 sm:p-8 md:p-10 mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Compute Units</h1>
        <ComputeUnitsDistributionChart />
        <div className="my-6">
          <ComputeUnitsAreaChart />
        </div>
      </div>

      <div id="blocks" className="p-5 sm:p-8 md:p-10 mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Blocks</h1>
        <Card className="container mx-auto shadow-lg grid grid-cols-1 lg:grid-cols-2 p-4 gap-10">
          <BlockProductionRateChart />
          <BlocktimeChart />
        </Card>
      </div>
      <FeesSection />

      <div
        id="summary"
        className="p-5 sm:p-8 md:p-10 mx-auto w-full text-center"
      >
        <h1 className="text-3xl font-bold ml-5">Overview</h1>
        <p className="text-lg mb-6 ml-5">
          {" "}
          A quick summary of all the recent metrics.{" "}
        </p>
        <div className="container mx-auto flex items-center justify-center !border-transparent shadow-lg  p-4 gap-10">
          <BlockchainAveragesTable />
        </div>
      </div>

      {/* <div id="fees" className="p-10 mx-auto w-full">
      <h1 className="text-3xl font-bold mb-6">Fees</h1>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-3/4">
          <FeesDistributionChart />
        </div>
        <div className="w-full lg:w-1/4 flex flex-col gap-4">
          <MinFeeCard minFee={feeStats.min} />
          <MaxFeeCard maxFee={feeStats.max} />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <MeanFeeCard meanFee={feeStats.mean} />
        <MedianFeeCard medianFee={feeStats.median} />
        <ModeFeeCard modeFee={feeStats.mode} />
      </div>
    </div> */}
    </div>
  );
}

export default Performance;
