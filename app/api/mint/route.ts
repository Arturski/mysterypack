import { NextResponse } from "next/server";
import { blockchainData } from "@imtbl/sdk";
import { client } from "@/lib/client";

export async function POST(request: Request) {
  console.log("📩 [POST] /api/mint called");

  try {
    const body = await request.json();
    console.log("🔍 Request Body:", body);

    const { walletAddress, tokenId } = body;

    if (!walletAddress || !tokenId) {
      console.warn("⚠️ Missing wallet address or tokenId");
      return NextResponse.json(
        { error: "walletAddress and tokenId are required" },
        { status: 400 }
      );
    }

    // Only allow token ID 1 (pack) or 2 (VIP pass)
    if (tokenId !== "1" && tokenId !== "2") {
      console.warn("⚠️ Invalid tokenId:", tokenId);
      return NextResponse.json(
        { error: "Invalid tokenId. Must be '1' or '2'" },
        { status: 400 }
      );
    }

    console.log(`👛 Minting token ID ${tokenId} for wallet: ${walletAddress}`);

    const reference_id = `mint-${tokenId}-${Date.now()}`;
    console.log(`🆔 Generated reference ID: ${reference_id}`);

    const contractAddress = process.env.NEXT_PUBLIC_PACK_CONTRACT_ADDRESS;
    if (!contractAddress) {
      console.error("❌ Contract address is missing in env vars");
      return NextResponse.json(
        { error: "Contract address not configured" },
        { status: 500 }
      );
    }

    const res: blockchainData.Types.CreateMintRequestResult =
      await client.createMintRequest({
        chainName: "imtbl-zkevm-testnet",
        contractAddress,
        createMintRequestRequest: {
          assets: [
            {
              reference_id,
              owner_address: walletAddress,
              token_id: tokenId,
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
      "❌ Failed to mint:",
      error?.response?.data || error.message || error
    );
    return NextResponse.json(
      { error: error?.message || "Failed to mint" },
      { status: 500 }
    );
  }
}
