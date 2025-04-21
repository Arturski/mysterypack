"use client";

import axios from "axios";

const PACK_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SPECIALS_CONTRACT_ADDRESS;
const ALIEN_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ALIEN_CONTRACT_ADDRESS;

export async function fetchInventory(walletAddress: string) {
  if (!walletAddress) {
    throw new Error("Wallet address is required to fetch inventory.");
  }

  console.log("🔍 Fetching inventory for:", walletAddress);

  try {
    const [packsResponse, aliensResponse] = await Promise.all([
      axios.get(
        `https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/accounts/${walletAddress}/nfts`,
        {
          params: { contract_address: PACK_CONTRACT_ADDRESS },
          headers: { Accept: "application/json" },
        }
      ),
      axios.get(
        `https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/accounts/${walletAddress}/nfts`,
        {
          params: { contract_address: ALIEN_CONTRACT_ADDRESS },
          headers: { Accept: "application/json" },
        }
      ),
    ]);

    const packs = (packsResponse.data.result || []).map((nft: any) => ({
      ...nft,
      collection: "pack",
    }));

    const aliens = (aliensResponse.data.result || []).map((nft: any) => ({
      ...nft,
      collection: "alien",
    }));

    return [...packs, ...aliens];
  } catch (error: any) {
    console.error("Inventory API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch inventory"
    );
  }
}

// lib/api.ts
export async function mintPack(
  walletAddress: string,
  tokenId: "1" | "2" = "1"
) {
  const res = await fetch("/api/mint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walletAddress, tokenId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to mint token");
  }

  return data;
}
