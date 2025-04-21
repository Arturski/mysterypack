"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Attribute {
  trait_type: string;
  value: string;
}

interface NFT {
  token_id: string;
  name: string;
  image: string;
  description: string;
  balance: string;
  collection: "pack" | "alien";
  contractAddress: string;
  attributes?: Attribute[];
}

interface Props {
  nft: NFT;
  onOpen: (nft: NFT) => void;
  onInfo: (nft: NFT) => void;
}

const rarityOrder: Record<string, number> = {
  Mythical: 1,
  Legendary: 2,
  Rare: 3,
  Common: 4,
  Unknown: 5,
};

const getRarity = (nft: NFT): string =>
  nft.attributes?.find((attr) => attr.trait_type === "Rarity")?.value ??
  "Unknown";

const getRarityStyle = (rarity: string | undefined): string => {
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
};

export function InventoryCard({ nft, onOpen, onInfo }: Props) {
  const rarity = getRarity(nft);

  return (
    <Card
      className={`relative flex flex-col justify-between ${getRarityStyle(
        rarity
      )}`}
    >
      {parseInt(nft.balance) > 1 && (
        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full shadow-md z-10">
          x{nft.balance}
        </div>
      )}
      <CardContent className="flex flex-col h-full justify-between">
        <div>
          <div className="aspect-square mb-2">
            <img
              src={nft.image || "/placeholder.svg"}
              alt={nft.name}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <p className="font-semibold text-center">{nft.name}</p>
          <p className="text-xs text-center text-muted-foreground">{rarity}</p>
        </div>
        <div className="flex gap-x-2 mt-4">
          {nft.collection === "pack" && (
            <Button className="flex-1" onClick={() => onOpen(nft)}>
              🎁 Open
            </Button>
          )}
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => onInfo(nft)}
          >
            ℹ️ Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
