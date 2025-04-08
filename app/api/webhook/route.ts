import { NextRequest, NextResponse } from "next/server";
import { webhook, config } from "@imtbl/sdk";

// ✅ Make this async
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();

  await webhook.handle(
    body,
    config.Environment.SANDBOX, // or config.Environment.PRODUCTION
    {
      all: async (event) => {
        if (event.event_name === "imtbl_zkevm_activity_burn") {
          const { token_id, contract_address } = event.data.details.asset;
          const from = event.data.details.from;
          const amount = event.data.details.amount;
          const tx = event.data.blockchain_metadata.transaction_hash;
          const block = event.data.blockchain_metadata.block_number;

          console.log("✨ Burn Event Received:");
          console.log("--------------------------");
          console.log(`🔹 Token ID: ${token_id}`);
          console.log(`🔹 Amount: ${amount}`);
          console.log(`🔹 From: ${from}`);
          console.log(`🔹 Contract: ${contract_address}`);
          console.log(`🔹 Tx Hash: ${tx}`);
          console.log(`🔹 Block: ${block}`);
          console.log("--------------------------");
        }
      },
    }
  );

  return NextResponse.json({ status: "ok" });
}
