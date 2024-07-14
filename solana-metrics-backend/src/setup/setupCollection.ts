import { databases, databaseId, collectionId } from "../config/appwrite";
import { logger } from "../utils/logger";
import { AppwriteException } from "node-appwrite";

interface AttributeDefinition {
  key: string;
  type: "string" | "integer" | "double" | "boolean" | "datetime";
  size?: number;
  required: boolean;
}

export async function setupCollection(): Promise<void> {
  const attributes: AttributeDefinition[] = [
    { key: "timestamp", type: "string", size: 64, required: true },
    { key: "blockProductionRate", type: "double", required: true },
    { key: "nonVoteTransactionRate", type: "double", required: true },
    { key: "voteTxPerMinute", type: "double", required: true },
    { key: "tps", type: "double", required: true },
    { key: "tpm", type: "double", required: true },
    { key: "blocktime", type: "double", required: true },
    { key: "feesPerMinute", type: "double", required: true },
    { key: "feeStats", type: "string", size: 1000, required: true },
    { key: "blockRewardsPerMinute", type: "double", required: true },
    { key: "computeUnitsPerMinute", type: "double", required: true },
    { key: "computeUnitStats", type: "string", size: 1000, required: true },
    { key: "apiCallCount", type: "integer", required: true },
    { key: "executionTime", type: "double", required: true },
  ];

  for (const attr of attributes) {
    try {
      switch (attr.type) {
        case "string":
          await databases.createStringAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.size || 255,
            attr.required
          );
          break;
        case "integer":
          await databases.createIntegerAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required
          );
          break;
        case "double":
          await databases.createFloatAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required
          );
          break;
        case "boolean":
          await databases.createBooleanAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required
          );
          break;
        case "datetime":
          await databases.createDatetimeAttribute(
            databaseId,
            collectionId,
            attr.key,
            attr.required
          );
          break;
      }
      logger.info(`Created attribute: ${attr.key}`);
    } catch (error) {
      if (
        error instanceof AppwriteException &&
        error.type === "attribute_already_exists"
      ) {
        logger.warn(`Attribute ${attr.key} already exists. Skipping.`);
      } else {
        logger.error(`Error creating attribute ${attr.key}:`, error);
      }
    }
  }

  logger.info("Collection setup completed");
}

// Function to run the setup
export async function runSetup(): Promise<void> {
  try {
    await setupCollection();
    logger.info("Setup completed successfully");
  } catch (error) {
    logger.error("Error during setup:", error);
  }
}

// Run the setup if this script is executed directly
if (require.main === module) {
  runSetup();
}
