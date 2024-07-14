import { SolanaService } from "../services/solanaService";
import { AppwriteService } from "../services/appwriteService";
import { logger } from "../utils/logger";
import { MetricsData } from "../types";

export class MetricsCollector {
  private solanaService: SolanaService;
  private appwriteService: AppwriteService;
  private isRunning: boolean = false;

  constructor() {
    this.solanaService = new SolanaService();
    this.appwriteService = new AppwriteService();
  }

  async collectAndSaveMetrics(): Promise<void> {
    if (this.isRunning) {
      logger.info(
        "Metrics collection already in progress. Skipping this execution."
      );
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();

    try {
      logger.info("Starting metrics collection");

      // Collect block production rate
      const {
        blockProductionRate,
        startSlot,
        endSlot,
        startTime: blockStartTime,
        endTime: blockEndTime,
      } = await this.solanaService.getBlockProductionRate();

      // Process blocks
      const {
        nonVoteTransactions,
        voteTransactions,
        feeStats,
        computeUnitStats,
      } = await this.solanaService.processBlocks(startSlot, endSlot);

      // Calculate time-based metrics
      const timeElapsedInSeconds = (blockEndTime - blockStartTime) / 1000;
      const timeElapsedInMinutes = timeElapsedInSeconds / 60;

      // Calculate transaction metrics
      const totalTransactions = nonVoteTransactions + voteTransactions;
      const tps = totalTransactions / timeElapsedInSeconds;
      const tpm = totalTransactions / timeElapsedInMinutes;
      const voteTxPerMinute = voteTransactions / timeElapsedInMinutes;
      const blocktime = timeElapsedInSeconds / (endSlot - startSlot);

      // Calculate rate metrics
      const nonVoteTransactionRate = nonVoteTransactions / timeElapsedInMinutes;
      const feesPerMinute = feeStats.getMean() * nonVoteTransactionRate;
      const computeUnitsPerMinute =
        computeUnitStats.getMean() * nonVoteTransactionRate;

      // Get block rewards
      const blockRewardsPerMinute =
        await this.solanaService.getBlockRewardsPerMinute(blockProductionRate);

      // Prepare metrics data
      const metrics: MetricsData = {
        timestamp: new Date().toISOString(),
        blockProductionRate,
        nonVoteTransactionRate,
        voteTxPerMinute,
        tps,
        tpm,
        blocktime,
        feesPerMinute,
        feeStats: JSON.stringify(feeStats.getStats()),
        blockRewardsPerMinute,
        computeUnitsPerMinute,
        computeUnitStats: JSON.stringify(computeUnitStats.getStats()),
        apiCallCount: this.solanaService.getApiCallCount(),
        executionTime: (Date.now() - startTime) / 1000,
        transactions: {
          total: totalTransactions,
          nonVote: nonVoteTransactions,
          vote: voteTransactions,
        },
      };

      // Save metrics
      await this.appwriteService.saveMetrics(metrics);

      logger.info("Metrics collected and saved successfully", {
        executionTime: metrics.executionTime,
        apiCalls: metrics.apiCallCount,
      });
    } catch (error) {
      logger.error("Error in metrics collection:", error);
    } finally {
      this.isRunning = false;
    }
  }
}
