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
      </div>

      <div id="blocks" className="p-5 sm:p-8 md:p-10 mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Blocks</h1>
        <Card className="container mx-auto shadow-lg grid grid-cols-1 lg:grid-cols-2 p-4 gap-10">
          <BlockProductionRateChart />
          <BlocktimeChart />
        </Card>
      </div>

      <div id="fees" className="p-10 mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6">Fees</h1>
        <FeesDistributionChart />
      </div>
    </div>
  );
}

export default Performance;
