import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const API_KEY = "sk_imapik-test-i551Syy9kSUgToJ-uti5_baebac";
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
