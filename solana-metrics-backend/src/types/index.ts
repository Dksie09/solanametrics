export interface MetricsData {
  timestamp: string;
  blockProductionRate: number;
  nonVoteTransactionRate: number;
  voteTxPerMinute: number;
  tps: number;
  tpm: number;
  blocktime: number;
  feesPerMinute: number;
  feeStats: string;
  blockRewardsPerMinute: number;
  computeUnitsPerMinute: number;
  computeUnitStats: string;
  apiCallCount: number;
  executionTime: number;
  transactions: object;
}
