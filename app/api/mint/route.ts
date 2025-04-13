import { NextResponse } from "next/server";
import { blockchainData } from "@imtbl/sdk";
import { client } from "@/lib/client";

export async function POST(request: Request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
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
            },
          ],
        },
      });

    return NextResponse.json({
      success: true,
      reference_id,
      mintRequest: res,
    });
  } catch (error) {
    console.error("❌ Failed to mint pack:", error);
    return NextResponse.json({ error: "Failed to mint pack" }, { status: 500 });
  }
}
