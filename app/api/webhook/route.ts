import { NextRequest, NextResponse } from "next/server";
import { webhook, config } from "@imtbl/sdk";

// ✅ Handles all incoming webhook events
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    await webhook.handle(
      body,
      config.Environment.SANDBOX, // Change to PRODUCTION when ready
      {
        // Handle all events here
        all: async (event) => {
          switch (event.event_name) {
            case "imtbl_zkevm_activity_burn": {
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
              break;
            }

            default:
              console.log(`📩 Received event: ${event.event_name}`);
              break;
          }
        },
      }
    );

    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("❌ Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook handling failed" },
      { status: 500 }
    );
  }
}
