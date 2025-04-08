import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const API_KEY = "sk_imapik-test-i551Syy9kSUgToJ-uti5_baebac";
const OWNER_ADDRESS = "0x99B66F2f71fF9F4c773dF1446B45e4CFAC522965";
const PACK_CONTRACT_ADDRESS = "0xb001670b074140aa6942fbf62539562c65843719";
const ALIEN_CONTRACT_ADDRESS = "0x0b0c90da7d6c8a170cf3ef8e9f4ebe53682d3671";

export async function fetchInventory() {
  console.log("Starting fetchInventory...");

  try {
    // Fetch packs
    const packsResponse = await axios.get(
      `https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/accounts/${OWNER_ADDRESS}/nfts`,
      {
        params: {
          contract_address: PACK_CONTRACT_ADDRESS,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );

    // Fetch aliens
    const aliensResponse = await axios.get(
      `https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/accounts/${OWNER_ADDRESS}/nfts`,
      {
        params: {
          contract_address: ALIEN_CONTRACT_ADDRESS,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );

    const packs = (packsResponse.data.result || []).map((nft) => ({
      ...nft,
      collection: "pack",
    }));

    const aliens = (aliensResponse.data.result || []).map((nft) => ({
      ...nft,
      collection: "alien",
    }));

    console.log("Packs:", packs);
    console.log("Aliens:", aliens);

    return [...packs, ...aliens];
  } catch (error) {
    console.error("API Error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch inventory"
    );
  }
}

export async function mintPack() {
  console.log("Starting mintPack...");

  // Generate a random token ID between 1 and 1000000
  const randomTokenId = Math.floor(Math.random() * 1000000) + 1;
  const referenceId = uuidv4();

  console.log(
    `Minting pack with token ID: ${randomTokenId} and reference ID: ${referenceId}`
  );

  try {
    const response = await axios.post(
      `https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/collections/${PACK_CONTRACT_ADDRESS}/nfts/mint-requests`,
      {
        assets: [
          {
            reference_id: referenceId,
            owner_address: OWNER_ADDRESS,
            token_id: randomTokenId.toString(),
            amount: "1",
            metadata: {
              id: randomTokenId,
              image:
                "https://raw.githubusercontent.com/Arturski/public-static/refs/heads/main/demo/aliens/alien-pack-cover.webp",
              token_id: randomTokenId.toString(),
              name: "Alien Mystery Pack",
              description:
                "Alien Mystery Pack contains 3 Aliens. Luck Probability Common: 55%, Rare 30%, Legendary 12%, Mythical 3%",
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

    console.log("Mint Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Mint Error:", error.response?.data || error);
    throw new Error(error.response?.data?.message || "Failed to mint pack");
  }
}
