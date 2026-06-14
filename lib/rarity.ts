import type { NFT } from "@/types/nft";

// Single source of truth for rarity ordering, colours and styling.
// Previously duplicated across inventory.tsx, inventory-card.tsx and
// alien-reveal-modal.tsx.

export type Rarity = "Mythical" | "Legendary" | "Rare" | "Common" | "Unknown";

export const rarityOrder: Record<Rarity, number> = {
  Mythical: 1,
  Legendary: 2,
  Rare: 3,
  Common: 4,
  Unknown: 5,
};

// Tailwind border + glow classes per rarity tier (cyberpunk neon system).
export const rarityGlow: Record<Rarity, string> = {
  Mythical: "border-cyan-400/80 shadow-[0_0_18px_-2px] shadow-cyan-400/60",
  Legendary: "border-amber-400/80 shadow-[0_0_18px_-2px] shadow-amber-400/60",
  Rare: "border-violet-400/80 shadow-[0_0_16px_-3px] shadow-violet-400/55",
  Common: "border-slate-500/60 shadow-[0_0_10px_-4px] shadow-slate-400/40",
  Unknown: "border-border shadow-none",
};

// Text colour per rarity tier, for labels.
export const rarityText: Record<Rarity, string> = {
  Mythical: "text-cyan-300",
  Legendary: "text-amber-300",
  Rare: "text-violet-300",
  Common: "text-slate-300",
  Unknown: "text-muted-foreground",
};

export function getRarity(nft: Pick<NFT, "attributes">): Rarity {
  const value = nft.attributes?.find(
    (attr) => attr.trait_type === "Rarity"
  )?.value;
  if (typeof value === "string" && value in rarityOrder) {
    return value as Rarity;
  }
  return "Unknown";
}

export function getRarityGlow(rarity: Rarity): string {
  return rarityGlow[rarity] ?? rarityGlow.Unknown;
}

export function getRarityText(rarity: Rarity): string {
  return rarityText[rarity] ?? rarityText.Unknown;
}
