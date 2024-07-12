// types/BlockchainStats.ts

export interface BlockchainStats {
  apiCallCount: number;
  blockProductionRate: number;
  blockRewardsPerMinute: number;
  blocktime: number;
  computeUnitStats: {
    min: number;
    max: number;
    mean: number;
    median: number;
    variance: number;
  };
  computeUnitsPerMinute: number;
  executionTime: number;
  feesPerMinute: number;
  feeStats: {
    min: number;
    max: number;
    mean: number;
    median: number;
    variance: number;
  };
  nonVoteTransactionRate: number;
  timestamp: Date;
  tpm: number;
  tps: number;
  voteTxPerMinute: number;
}
