// lib/solana/stakeAnalysis.ts

import { StakeAccountInfo, StakeAnalysisResult } from "../../types/solana";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getStakeAccounts, getInflationRewards } from "./solanaHelpers";

export async function analyzeStakeAccounts(
  walletAddress: string
): Promise<StakeAnalysisResult> {
  const connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");
  const allStakeAccounts = await getStakeAccounts(connection, walletAddress);

  let stakeAccountsInfo: StakeAccountInfo[] = [];
  let totalStakedAmount = 0;
  let totalRewardsEarned = 0;

  const currentEpoch = (await connection.getEpochInfo()).epoch;

  for (const account of allStakeAccounts) {
    if ("parsed" in account.account.data) {
      const accountInfo = account.account.data.parsed.info;
      const stakeAmount =
        Number(accountInfo.stake.delegation.stake) / LAMPORTS_PER_SOL;
      totalStakedAmount += stakeAmount;
      const activationEpoch = Number(
        accountInfo.stake.delegation.activationEpoch
      );
      const deactivationEpoch =
        accountInfo.stake.delegation.deactivationEpoch === 18446744073709551615
          ? "Not Set"
          : accountInfo.stake.delegation.deactivationEpoch;

      stakeAccountsInfo.push({
        pubkey: account.pubkey.toBase58(),
        delegatedStake: stakeAmount,
        voter: accountInfo.stake.delegation.voter,
        activationEpoch: activationEpoch,
        deactivationEpoch: deactivationEpoch,
        totalRewards: 0,
      });
    }
  }

  const stakeAccountPubkeys = allStakeAccounts.map((account) => account.pubkey);
  const batchSize = 15;
  const minActivationEpoch = Math.min(
    ...stakeAccountsInfo.map((info) => info.activationEpoch)
  );

  const fetchRewardsForEpochRange = async (
    startEpoch: number,
    endEpoch: number
  ) => {
    const epochRange = Array.from(
      { length: endEpoch - startEpoch + 1 },
      (_, i) => startEpoch + i
    );
    const rewardsArray = await Promise.all(
      epochRange.map((epoch) =>
        getInflationRewards(connection, stakeAccountPubkeys, epoch)
      )
    );

    rewardsArray.forEach((rewards) => {
      rewards.forEach((reward, index) => {
        if (reward) {
          const rewardAmount = Number(reward.amount) / LAMPORTS_PER_SOL;
          stakeAccountsInfo[index].totalRewards += rewardAmount;
          totalRewardsEarned += rewardAmount;
        }
      });
    });
  };

  const epochRanges = [];
  for (
    let startEpoch = minActivationEpoch;
    startEpoch <= currentEpoch;
    startEpoch += batchSize
  ) {
    const endEpoch = Math.min(startEpoch + batchSize - 1, currentEpoch);
    epochRanges.push([startEpoch, endEpoch]);
  }

  await Promise.all(
    epochRanges.map(([start, end]) => fetchRewardsForEpochRange(start, end))
  );

  return {
    totalAccountsFound: allStakeAccounts.length,
    totalAmountStaked: totalStakedAmount,
    totalRewardsEarned: totalRewardsEarned,
    stakeAccounts: stakeAccountsInfo,
  };
}
