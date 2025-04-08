import { NextResponse } from "next/server";

// In a real app, this would be your database
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

  // Reset count if it's a new day
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

    // In a real app, this would trigger the actual minting process
    const packId = crypto.randomUUID();

    return NextResponse.json({
      success: true,
      packId,
      remainingMints: 2 - mintingHistory[walletAddress].count,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to mint pack" }, { status: 500 });
  }
}
