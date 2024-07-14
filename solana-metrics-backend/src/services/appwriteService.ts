import { databases, databaseId, collectionId } from "../config/appwrite";
import { ID } from "node-appwrite";
import { MetricsData } from "../types";
import { logger } from "../utils/logger";

export class AppwriteService {
  async saveMetrics(metrics: MetricsData): Promise<void> {
    try {
      await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        metrics
      );
      logger.info("Metrics saved successfully to Appwrite");
    } catch (error) {
      logger.error("Error saving metrics to Appwrite:", error);
      throw error;
    }
  }
}
