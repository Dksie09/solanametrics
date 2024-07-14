export interface StakeAccountInfo {
  pubkey: string;
  delegatedStake: number;
  voter: string;
  activationEpoch: number;
  deactivationEpoch: string | number;
  totalRewards: number;
}

export interface StakeAnalysisResult {
  totalAccountsFound: number;
  totalAmountStaked: number;
  totalRewardsEarned: number;
  stakeAccounts: StakeAccountInfo[];
}
