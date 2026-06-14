"use client";

import { BadgeCheck } from "lucide-react";
import { MintCard } from "./mint-card";
import { VIP_PASS_TOKEN_ID } from "@/lib/constants";

export function MintVipPass() {
  return (
    <MintCard
      title="VIP Pass"
      description="A collectible pass for holders — unlocks Discord roles and special areas (coming soon)."
      tokenId={VIP_PASS_TOKEN_ID}
      icon={<BadgeCheck className="h-5 w-5 text-accent" />}
      badge="ERC-1155 · #2"
      ctaLabel="Mint VIP Pass"
      variant="secondary"
      accentClass="border-accent/40"
      successTitle="VIP Pass minted!"
      successDescription="Your VIP Pass is in your inventory."
    />
  );
}
