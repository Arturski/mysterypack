import { NextRequest, NextResponse } from "next/server";
import { webhook, config } from "@imtbl/sdk";
import axios from "axios";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Handle subscription confirmation manually
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

    // Handle event messages via Immutable SDK
    await webhook.handle(body, config.Environment.SANDBOX, {
      all: async (event) => {
        if (event.event_name === "imtbl_zkevm_activity_burn") {
          const { token_id, contract_address } = event.data.details.asset;
          const from = event.data.details.from;
          const amount = event.data.details.amount;
          const tx = event.data.blockchain_metadata.transaction_hash;
          const block = event.data.blockchain_metadata.block_number;

          console.log("\n🔥 Burn Event Received:");
          console.log("───────────────────────────────");
          console.log(`🔹 Token ID:     ${token_id}`);
          console.log(`🔹 Amount:       ${amount}`);
          console.log(`🔹 From:         ${from}`);
          console.log(`🔹 Contract:     ${contract_address}`);
          console.log(`🔹 Tx Hash:      ${tx}`);
          console.log(`🔹 Block Number: ${block}`);
          console.log("───────────────────────────────\n");
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
