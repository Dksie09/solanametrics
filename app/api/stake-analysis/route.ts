import { NextRequest, NextResponse } from "next/server";
import { analyzeStakeAccounts } from "@/lib/solana/stakeAnalysis";
import { StakeAnalysisResult } from "@/types/solana";

export const revalidate = 3600; // Cache for 1 hour

export async function GET(request: NextRequest) {
  const walletAddress = request.nextUrl.searchParams.get("walletAddress");

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Wallet address is required" },
      { status: 400 }
    );
  }

  try {
    const result = await analyzeStakeAccounts(walletAddress);

    // Cache the response for 1 hour
    return NextResponse.json(result, {
      headers: {
        "Cache-Control":
          "max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error in stake analysis:", error);
    return NextResponse.json(
      { error: "An error occurred during analysis" },
      { status: 500 }
    );
  }
}
