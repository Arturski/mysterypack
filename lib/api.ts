"use client";

import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const API_KEY = "sk_imapik-test-oK4LbHJXlaCK0FOa-zVg_8a303b";
const PACK_CONTRACT_ADDRESS = "0xb001670b074140aa6942fbf62539562c65843719";
const ALIEN_CONTRACT_ADDRESS = "0x0b0c90da7d6c8a170cf3ef8e9f4ebe53682d3671";

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
    console.error("❌ Inventory API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch inventory"
    );
  }
}

export async function mintPack(walletAddress: string) {
  if (!walletAddress)
    throw new Error("Wallet address is required for minting.");

  const referenceId = uuidv4();

  console.log("🚀 Minting pack with auto-assigned token ID");

  try {
    const response = await axios.post(
      `https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/${PACK_CONTRACT_ADDRESS}/nfts/mint-requests`,
      {
        assets: [
          {
            reference_id: referenceId,
            owner_address: walletAddress,
            amount: "1",
            token_id: "1",
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
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "x-immutable-api-key": API_KEY,
        },
      }
    );

    console.log("✅ Mint Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("❌ Mint Error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Failed to mint pack");
  }
}
