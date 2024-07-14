import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  VOTE_PROGRAM_ID,
} from "@solana/web3.js";
import { RunningStats } from "../utils/runningStats";
import { logger } from "../utils/logger";

export class SolanaService {
  private connection: Connection;
  private apiCallCount: number = 0;
  private readonly MAX_PARALLEL_CALLS = 40;
  private readonly MAX_RETRIES = 3;

  constructor() {
    this.connection = new Connection(process.env.SOLANA_RPC_URL!, "confirmed");
  }

  private incrementApiCallCount(): void {
    this.apiCallCount++;
  }

  getApiCallCount(): number {
    return this.apiCallCount;
  }

  async getBlockProductionRate(): Promise<{
    blockProductionRate: number;
    startSlot: number;
    endSlot: number;
    startTime: number;
    endTime: number;
  }> {
    const startSlot = await this.connection.getSlot("recent");
    this.incrementApiCallCount();
    const startTime = Date.now();

    await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 second wait

    const endSlot = await this.connection.getSlot("recent");
    this.incrementApiCallCount();
    const endTime = Date.now();

    const slotsProduced = endSlot - startSlot;
    const timeElapsedInMinutes = (endTime - startTime) / 60000;

    const blockProductionRate = slotsProduced / timeElapsedInMinutes;
    return { blockProductionRate, startSlot, endSlot, startTime, endTime };
  }

  private async fetchBlockWithRetries(slot: number, retries = 0): Promise<any> {
    try {
      const block = await this.connection.getBlock(slot, {
        maxSupportedTransactionVersion: 0,
        transactionDetails: "full",
        rewards: false,
      });
      this.incrementApiCallCount();
      return block;
    } catch (error) {
      if (retries < this.MAX_RETRIES) {
        return this.fetchBlockWithRetries(slot, retries + 1);
      } else {
        if (
          error instanceof Error &&
          (error.message.includes("Slot was skipped") ||
            error.message.includes("missing due to ledger jump") ||
            error.message.includes("Block not available"))
        ) {
          return null;
        } else {
          throw error;
        }
      }
    }
  }

  async processBlocks(
    startSlot: number,
    endSlot: number
  ): Promise<{
    nonVoteTransactions: number;
    voteTransactions: number;
    feeStats: RunningStats;
    computeUnitStats: RunningStats;
  }> {
    let nonVoteTransactions = 0;
    let voteTransactions = 0;
    const feeStats = new RunningStats();
    const computeUnitStats = new RunningStats();

    const promises = [];
    for (
      let slot = startSlot;
      slot <= endSlot;
      slot += this.MAX_PARALLEL_CALLS
    ) {
      const batchPromises = [];
      for (let i = 0; i < this.MAX_PARALLEL_CALLS && slot + i <= endSlot; i++) {
        batchPromises.push(this.fetchBlockWithRetries(slot + i));
      }
      promises.push(Promise.all(batchPromises));
    }

    const blockBatches = await Promise.all(promises);

    blockBatches.flat().forEach((block) => {
      if (block && block.transactions) {
        block.transactions.forEach((tx: any) => {
          const message = tx.transaction.message;
          const instructions = message.instructions || [];
          const logMessages = tx.meta.logMessages || [];

          const isVoteTransaction = instructions.some((instruction: any) => {
            if (instruction && instruction.programId) {
              const programId = instruction.programId.toString();
              return programId === VOTE_PROGRAM_ID.toString();
            }
            return false;
          });

          const voteProgramInvoked = logMessages.some((log: string) =>
            log.includes(
              "Program Vote111111111111111111111111111111111111111 invoke"
            )
          );

          if (isVoteTransaction || voteProgramInvoked) {
            voteTransactions++;
          } else {
            nonVoteTransactions++;
            if (tx.meta && tx.meta.fee) {
              feeStats.update(tx.meta.fee);
            }
          }

          if (tx.meta && tx.meta.computeUnitsConsumed) {
            computeUnitStats.update(tx.meta.computeUnitsConsumed);
          }
        });
      }
    });

    return {
      nonVoteTransactions,
      voteTransactions,
      feeStats,
      computeUnitStats,
    };
  }

  async getBlockRewardsPerMinute(blockProductionRate: number): Promise<number> {
    const inflationRate = await this.connection.getInflationRate();
    this.incrementApiCallCount();

    const totalSupply = await this.connection.getSupply();
    this.incrementApiCallCount();
    const totalCirculatingSupply = totalSupply.value.circulating;

    const yearlyRewards = totalCirculatingSupply * inflationRate.total;
    const rewardsPerMinute = yearlyRewards / (365 * 24 * 60);
    return rewardsPerMinute;
  }
}
