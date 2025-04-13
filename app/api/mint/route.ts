import { NextResponse } from "next/server";
import { blockchainData } from "@imtbl/sdk";
import { client } from "@/lib/client";

export async function POST(request: Request) {
  console.log("📩 [POST] /api/mint called");

  try {
    const body = await request.json();
    console.log("🔍 Request Body:", body);

    const { walletAddress } = body;

    if (!walletAddress) {
      console.warn("⚠️ Wallet address is missing");
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    console.log(`👛 Minting for wallet: ${walletAddress}`);

    const reference_id = `pack-${Date.now()}`;
    console.log(`🆔 Generated reference ID: ${reference_id}`);

    const contractAddress = process.env.NEXT_PUBLIC_PACK_CONTRACT_ADDRESS;
    if (!contractAddress) {
      console.error("❌ Contract address is missing in env vars");
      return NextResponse.json(
        { error: "Contract address not configured" },
        { status: 500 }
      );
    }

    console.log(`🏗️ Using contract address: ${contractAddress}`);

    const res: blockchainData.Types.CreateMintRequestResult =
      await client.createMintRequest({
        chainName: "imtbl-zkevm-testnet",
        contractAddress,
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

    console.log("✅ Mint request created:", JSON.stringify(res, null, 2));

    return NextResponse.json({
      success: true,
      reference_id,
      mintRequest: res,
    });
  } catch (error: any) {
    console.error(
      "❌ Failed to mint pack:",
      error?.response?.data || error.message || error
    );
    return NextResponse.json(
      { error: error?.message || "Failed to mint pack" },
      { status: 500 }
    );
  }
}
