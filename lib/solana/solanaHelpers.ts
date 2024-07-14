import {
  Connection,
  PublicKey,
  AccountInfo,
  ParsedAccountData,
  InflationReward,
} from "@solana/web3.js";

const STAKE_PROGRAM_PK = new PublicKey(
  "Stake11111111111111111111111111111111111111"
);
const WALLET_OFFSET = 44;
const DATA_SIZE = 200;

export async function getStakeAccounts(
  connection: Connection,
  walletAddress: string
): Promise<
  Array<{ pubkey: PublicKey; account: AccountInfo<ParsedAccountData | Buffer> }>
> {
  const accounts = await connection.getParsedProgramAccounts(STAKE_PROGRAM_PK, {
    filters: [
      { dataSize: DATA_SIZE },
      { memcmp: { offset: WALLET_OFFSET, bytes: walletAddress } },
    ],
  });
  return accounts;
}

export async function getInflationRewards(
  connection: Connection,
  addresses: PublicKey[],
  epoch: number
): Promise<Array<InflationReward | null>> {
  try {
    return await connection.getInflationReward(addresses, epoch);
  } catch (error) {
    console.error(`Failed to fetch rewards for epoch ${epoch}:`, error);
    return [];
  }
}
