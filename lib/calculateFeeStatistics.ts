import { BlockchainStats } from "../types/BlockchainStats";

export function calculateFeeStatistics(data: BlockchainStats[]): {
  min: number;
  max: number;
  mean: number;
  median: number;
  variance: number;
} {
  const fees = data.map((d) => d.feesPerMinute);
  fees.sort((a, b) => a - b);

  const min = fees[0];
  const max = fees[fees.length - 1];
  const mean = fees.reduce((sum, fee) => sum + fee, 0) / fees.length;
  const median =
    fees.length % 2 === 0
      ? (fees[fees.length / 2 - 1] + fees[fees.length / 2]) / 2
      : fees[Math.floor(fees.length / 2)];

  // Calculate variance
  const variance =
    fees.reduce((sum, fee) => sum + Math.pow(fee - mean, 2), 0) / fees.length;

  return { min, max, mean, median, variance };
}
