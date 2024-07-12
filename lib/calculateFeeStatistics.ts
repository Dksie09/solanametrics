// utils/feeStatistics.ts

import { BlockchainStats } from "../types/BlockchainStats";

export function calculateFeeStatistics(data: BlockchainStats[]) {
  const fees = data.map((d) => d.feeStats.mean);
  fees.sort((a, b) => a - b);

  const min = fees[0];
  const max = fees[fees.length - 1];
  const mean = fees.reduce((sum, fee) => sum + fee, 0) / fees.length;

  let median;
  if (fees.length % 2 === 0) {
    median = (fees[fees.length / 2 - 1] + fees[fees.length / 2]) / 2;
  } else {
    median = fees[Math.floor(fees.length / 2)];
  }

  const modeMap: { [key: number]: number } = {};
  let maxCount = 0;
  let mode = fees[0];

  for (const fee of fees) {
    if (!modeMap[fee]) modeMap[fee] = 0;
    modeMap[fee]++;
    if (modeMap[fee] > maxCount) {
      maxCount = modeMap[fee];
      mode = fee;
    }
  }

  return { min, max, mean, median, mode };
}
