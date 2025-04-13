import { NextResponse } from "next/server";
import { blockchainData } from "@imtbl/sdk";
import { client } from "@/lib/client";
import { v4 as uuidv4 } from "uuid";

// In-memory mint limit tracking (per address per day)
const mintingHistory: Record<string, { lastMint: Date; count: number }> = {};

function canMint(walletAddress: string): boolean {
  const now = new Date();
  const today = now.toDateString();

  if (!mintingHistory[walletAddress]) {
    mintingHistory[walletAddress] = { lastMint: now, count: 0 };
    return true;
  }

  const history = mintingHistory[walletAddress];
  const lastMintDay = new Date(history.lastMint).toDateString();

  if (lastMintDay !== today) {
    history.count = 0;
    history.lastMint = now;
    return true;
  }

  return history.count < 2;
}

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    if (!canMint(walletAddress)) {
      return NextResponse.json(
        { error: "Daily minting limit reached" },
        { status: 429 }
      );
    }

    // Update minting history
    if (!mintingHistory[walletAddress]) {
      mintingHistory[walletAddress] = { lastMint: new Date(), count: 1 };
    } else {
      mintingHistory[walletAddress].count++;
      mintingHistory[walletAddress].lastMint = new Date();
    }

    const reference_id = `pack-${Date.now()}`;

    const res: blockchainData.Types.CreateMintRequestResult =
      await client.createMintRequest({
        chainName: "imtbl-zkevm-testnet",
        contractAddress: process.env.NEXT_PUBLIC_PACK_CONTRACT_ADDRESS!,
        createMintRequestRequest: {
          assets: [
            {
              reference_id,
              owner_address: walletAddress,
              token_id: "1",
              amount: "1",
              metadata: {
                name: "Alien Mystery Pack",
                image:
                  "https://raw.githubusercontent.com/Arturski/public-static/refs/heads/main/demo/aliens/alien-pack-cover.webp",
                description:
                  "Alien Mystery Pack contains 3 Aliens. Luck Probability: Common 55%, Rare 30%, Legendary 12%, Mythical 3%",
                external_url:
                  "https://immutable-metadata-api.vercel.app/collections/9/nfts/1",
              },
            },
          ],
        },
      });

    return NextResponse.json({
      success: true,
      reference_id,
      remainingMints: 2 - mintingHistory[walletAddress].count,
      mintRequest: res,
    });
  } catch (error) {
    console.error("❌ Failed to mint pack:", error);
    return NextResponse.json({ error: "Failed to mint pack" }, { status: 500 });
  }
}
