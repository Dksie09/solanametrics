import cron from "node-cron";
import { MetricsCollector } from "./jobs/metricsCollector";
import { logger } from "./utils/logger";

const metricsCollector = new MetricsCollector();

cron.schedule("* * * * *", async () => {
  logger.info("Starting metrics collection job");
  await metricsCollector.collectAndSaveMetrics();
});

logger.info("Solana metrics backend started");
