import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const rarityOrder = {
  Mythical: 1,
  Legendary: 2,
  Rare: 3,
  Common: 4,
  Unknown: 5,
};

export function getRarity(nft: any) {
  return (
    nft.attributes?.find((attr: any) => attr.trait_type === "Rarity")?.value ??
    "Unknown"
  );
}

export function getRarityStyle(rarity: any) {
  switch (rarity) {
    case "Mythical":
      return "border-4 border-cyan-400 shadow-xl shadow-cyan-400/50";
    case "Legendary":
      return "border-4 border-yellow-400 shadow-lg shadow-yellow-400/50";
    case "Rare":
      return "border-4 border-purple-400 shadow-md shadow-purple-400/50";
    case "Common":
      return "border-4 border-gray-300 shadow shadow-gray-300/50";
    default:
      return "border border-muted shadow";
  }
}
