"use client";

import axios from "axios";
import {
  SPECIALS_CONTRACT_ADDRESS,
  ALIENS_CONTRACT_ADDRESS,
} from "@/lib/constants";
import type { NFT } from "@/types/nft";

const NFT_API_BASE =
  "https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/accounts";

export async function fetchInventory(walletAddress: string): Promise<NFT[]> {
  if (!walletAddress) {
    throw new Error("Wallet address is required to fetch inventory.");
  }

  try {
    const [packsResponse, aliensResponse] = await Promise.all([
      axios.get(`${NFT_API_BASE}/${walletAddress}/nfts`, {
        params: { contract_address: SPECIALS_CONTRACT_ADDRESS },
        headers: { Accept: "application/json" },
      }),
      axios.get(`${NFT_API_BASE}/${walletAddress}/nfts`, {
        params: { contract_address: ALIENS_CONTRACT_ADDRESS },
        headers: { Accept: "application/json" },
      }),
    ]);

    const packs: NFT[] = (packsResponse.data.result || []).map((nft: any) => ({
      ...nft,
      collection: "pack" as const,
    }));

    const aliens: NFT[] = (aliensResponse.data.result || []).map(
      (nft: any) => ({
        ...nft,
        collection: "alien" as const,
      })
    );

    return [...packs, ...aliens];
  } catch (error: any) {
    console.error("Inventory API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch inventory"
    );
  }
}

export async function mintAsset(walletAddress: string, tokenId: string) {
  const res = await fetch("/api/mint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress, tokenId }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to mint asset");
  }

  return data;
}
