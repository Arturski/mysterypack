"use client";

import { Gift } from "lucide-react";
import { MintCard } from "./mint-card";
import { PACK_TOKEN_ID } from "@/lib/constants";

const PACK_COVER =
  "https://raw.githubusercontent.com/Arturski/public-static/refs/heads/main/demo/aliens/alien-pack-cover.webp";

export function MintPack() {
  return (
    <MintCard
      title="Mystery Pack"
      description="Each pack burns to reveal 3 random Aliens — anything from Common to Mythical."
      tokenId={PACK_TOKEN_ID}
      icon={<Gift className="h-5 w-5 text-primary" />}
      image={PACK_COVER}
      badge="ERC-1155 · #1"
      ctaLabel="Mint Mystery Pack"
      accentClass="border-primary/40"
      successTitle="Pack minted!"
      successDescription="Your Alien Mystery Pack is in your inventory — open it to reveal your aliens."
    />
  );
}
