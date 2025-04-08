import { NextRequest, NextResponse } from "next/server";
import { webhook, config } from "@imtbl/sdk";
import axios from "axios";
import { faker } from "@faker-js/faker";

const BASE_IMAGE_URL =
  "https://raw.githubusercontent.com/Arturski/public-static/main/demo/aliens/";
const imagePool = {
  Common: [
    "c1.webp",
    "c2.webp",
    "c3.webp",
    "c4.webp",
    "c5.webp",
    "c6.webp",
    "c7.webp",
    "c8.webp",
    "c9.webp",
    "c10.webp",
    "c11.webp",
    "c12.webp",
  ],
  Rare: [
    "r1.webp",
    "r2.webp",
    "r3.webp",
    "r4.webp",
    "r5.webp",
    "r6.webp",
    "r7.webp",
    "r8.webp",
  ],
  Legendary: ["l1.webp", "l2.webp", "l3.webp", "l4.webp", "l5.webp", "l6.webp"],
  Mythical: ["m1.webp", "m2.webp", "m3.webp", "m4.webp"],
};

const rarityDistribution = [
  { rarity: "Common", chance: 0.55 },
  { rarity: "Rare", chance: 0.3 },
  { rarity: "Legendary", chance: 0.12 },
  { rarity: "Mythical", chance: 0.03 },
];

function getRandomRarityAlien(): keyof typeof imagePool {
  const roll = Math.random();
  let cumulative = 0;
  for (const { rarity, chance } of rarityDistribution) {
    cumulative += chance;
    if (roll < cumulative) return rarity as keyof typeof imagePool;
  }
  return "Common";
}

function generateAlienMetadata(tokenId: number) {
  const rarity = getRandomRarityAlien();
  const imageFilename =
    imagePool[rarity][Math.floor(Math.random() * imagePool[rarity].length)];
  const imageUrl = `${BASE_IMAGE_URL}${imageFilename}`;

  return {
    id: tokenId,
    image: imageUrl,
    token_id: tokenId.toString(),
    name: faker.person.fullName(),
    description: faker.lorem.sentence(),
    external_url: `https://immutable-metadata-api.vercel.app/collections/aliens/nfts/${tokenId}`,
    attributes: [
      { trait_type: "Rarity", value: rarity },
      {
        trait_type: "Power",
        value: Math.floor(Math.random() * (100 - 10 + 1)) + 10,
      },
      {
        trait_type: "Interdimensional",
        value: rarity === "Rare" || rarity === "Legendary",
      },
      { trait_type: "Fortune", value: Math.floor(Math.random() * 500) + 1 },
    ],
  };
}

// 🔧 Placeholder: Replace this with your real minting logic
async function mintAliens(to: string, reference: string) {
  const aliens = [1, 2, 3].map((i) => generateAlienMetadata(Date.now() + i));
  console.log(`🚀 Minting 3 Aliens to ${to} for ${reference}`);
  console.log(JSON.stringify(aliens, null, 2));
  // Replace this with actual mint call
  return aliens;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    if (body.Type === "SubscriptionConfirmation" && body.SubscribeURL) {
      console.log("📬 Subscription confirmation received. Confirming...");
      console.log("🔗 SubscribeURL:", body.SubscribeURL);

      try {
        const response = await axios.get(body.SubscribeURL);
        if (response.status === 200) {
          console.log("✅ Subscription confirmed successfully!");
        } else {
          console.error(
            "❌ Failed to confirm subscription. Status:",
            response.status
          );
        }
      } catch (err) {
        console.error("❌ Error confirming subscription:", err);
      }

      return NextResponse.json({ status: "confirmation processed" });
    }

    await webhook.handle(body, config.Environment.SANDBOX, {
      all: async (event) => {
        if (event.event_name === "imtbl_zkevm_activity_burn") {
          const { token_id, contract_address } = event.data.details.asset;
          const from = event.data.details.from;
          const reference = `burn-${token_id}`;

          console.log("\n🔥 Burn Event Received:");
          console.log("───────────────────────────────");
          console.log(`🔹 From:     ${from}`);
          console.log(`🔹 Token ID: ${token_id}`);
          console.log(`🔹 Contract: ${contract_address}`);
          console.log(`🔹 Mint Ref: ${reference}`);
          console.log("───────────────────────────────\n");

          await mintAliens(from, reference);
        } else {
          console.log("📦 Event Received:", event.event_name);
        }
      },
    });

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("❌ Webhook handler failed:", err);
    return NextResponse.json(
      { error: "Webhook handler failed." },
      { status: 500 }
    );
  }
}
