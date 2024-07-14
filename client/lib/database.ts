// utils/database.ts

import { databases } from "../lib/appwrite";
import { ID, Query } from "appwrite";
import { BlockchainStats } from "../types/BlockchainStats";

const DATABASE_ID = "db1";
const COLLECTION_ID = "cl1";

export async function getLatestDataFromAppwrite(): Promise<BlockchainStats | null> {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc("timestamp"),
      Query.limit(1),
    ]);

    if (response.documents.length === 0) {
      console.log("No matching documents.");
      return null;
    }

    const data = response.documents[0];

    // Ensure all required fields are present and of the correct type
    const blockchainStats: BlockchainStats = {
      apiCallCount: data.apiCallCount as number,
      blockProductionRate: data.blockProductionRate as number,
      blockRewardsPerMinute: data.blockRewardsPerMinute as number,
      blocktime: data.blocktime as number,
      computeUnitStats: JSON.parse(data.computeUnitStats),
      computeUnitsPerMinute: data.computeUnitsPerMinute as number,
      executionTime: data.executionTime as number,
      feesPerMinute: data.feesPerMinute as number,
      nonVoteTransactionRate: data.nonVoteTransactionRate as number,
      timestamp: new Date(data.timestamp),
      tpm: data.tpm as number,
      tps: data.tps as number,
      voteTxPerMinute: data.voteTxPerMinute as number,
      feeStats: JSON.parse(data.feeStats),
    };

    return blockchainStats;
  } catch (error) {
    console.error("Error fetching latest data from Appwrite:", error);
    return null;
  }
}

export async function getRecentDataFromAppwrite(
  limit: number = 10
): Promise<BlockchainStats[]> {
  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.orderDesc("timestamp"),
      Query.limit(limit),
    ]);

    return response.documents.map((doc) => ({
      apiCallCount: doc.apiCallCount as number,
      blockProductionRate: doc.blockProductionRate as number,
      blockRewardsPerMinute: doc.blockRewardsPerMinute as number,
      blocktime: doc.blocktime as number,
      computeUnitStats: JSON.parse(doc.computeUnitStats),
      computeUnitsPerMinute: doc.computeUnitsPerMinute as number,
      executionTime: doc.executionTime as number,
      feesPerMinute: doc.feesPerMinute as number,
      nonVoteTransactionRate: doc.nonVoteTransactionRate as number,
      timestamp: new Date(doc.timestamp),
      tpm: doc.tpm as number,
      tps: doc.tps as number,
      voteTxPerMinute: doc.voteTxPerMinute as number,
      feeStats: JSON.parse(doc.feeStats),
    }));
  } catch (error) {
    console.error("Error fetching recent data from Appwrite:", error);
    return [];
  }
}

interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
}

export async function getComputeUnitsUsedTimeSeries(
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesDataPoint[]> {
  return getTimeSeriesData("computeUnitsPerMinute", startTime, endTime);
}

export async function getFeesCollectedTimeSeries(
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesDataPoint[]> {
  return getTimeSeriesData("feesPerMinute", startTime, endTime);
}

async function getTimeSeriesData(
  field: keyof BlockchainStats,
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesDataPoint[]> {
  try {
    console.log(
      `Fetching ${field} data from ${startTime.toISOString()} to ${endTime.toISOString()}`
    );

    const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.greaterThan("timestamp", startTime.toISOString()),
      Query.lessThan("timestamp", endTime.toISOString()),
      Query.orderDesc("timestamp"),
      Query.limit(1000),
    ]);

    console.log(`Received ${response.documents.length} documents`);

    if (response.documents.length === 0) {
      console.log("No documents found in the specified time range");
    }

    const data = response.documents.map((doc) => {
      const timestamp = new Date(doc.timestamp);
      const value = doc[field] as number;
      console.log(`Timestamp: ${timestamp.toISOString()}, Value: ${value}`);
      return { timestamp, value };
    });

    console.log(`Returning ${data.length} data points`);
    return data.reverse(); // Reverse to maintain ascending order
  } catch (error) {
    console.error(`Error fetching ${field} time series data:`, error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return [];
  }
}

export async function getTpsTimeSeries(
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesDataPoint[]> {
  return getTimeSeriesData("tps", startTime, endTime);
}

export async function getTpmTimeSeries(
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesDataPoint[]> {
  return getTimeSeriesData("tpm", startTime, endTime);
}

export async function getBlockProductionRateTimeSeries(
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesDataPoint[]> {
  return getTimeSeriesData("blockProductionRate", startTime, endTime);
}

export async function getBlocktimeTimeSeries(
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesDataPoint[]> {
  return getTimeSeriesData("blocktime", startTime, endTime);
}

export async function getVoteTxPerMinuteTimeSeries(
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesDataPoint[]> {
  return getTimeSeriesData("voteTxPerMinute", startTime, endTime);
}

export async function getNonVoteTransactionRateTimeSeries(
  startTime: Date,
  endTime: Date
): Promise<TimeSeriesDataPoint[]> {
  return getTimeSeriesData("nonVoteTransactionRate", startTime, endTime);
}
