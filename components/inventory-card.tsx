"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, PackageOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRarity, getRarityGlow, getRarityText } from "@/lib/rarity";
import type { NFT } from "@/types/nft";

interface Props {
  nft: NFT;
  onOpen: (nft: NFT) => void;
  onInfo: (nft: NFT) => void;
}

export function InventoryCard({ nft, onOpen, onInfo }: Props) {
  const rarity = getRarity(nft);
  const balance = Number.parseInt(nft.balance ?? "1", 10);
  const isPack = nft.collection === "pack";

  return (
    <Card
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden border-2 bg-card/80 transition-transform duration-200 hover:-translate-y-1",
        getRarityGlow(rarity)
      )}
    >
      {balance > 1 && (
        <div className="absolute right-2 top-2 z-10 rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground shadow">
          ×{balance}
        </div>
      )}
      <CardContent className="flex h-full flex-col justify-between gap-3 p-3">
        <div>
          <div className="mb-2 aspect-square overflow-hidden rounded-md bg-secondary">
            <img
              src={nft.image || "/placeholder.svg"}
              alt={nft.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <p className="truncate text-center text-sm font-semibold" title={nft.name}>
            {nft.name}
          </p>
          <p
            className={cn(
              "text-center text-xs font-medium",
              getRarityText(rarity)
            )}
          >
            {rarity}
          </p>
        </div>
        <div className="flex gap-2">
          {isPack && (
            <Button size="sm" className="flex-1" onClick={() => onOpen(nft)}>
              <PackageOpen className="mr-1.5 h-4 w-4" />
              Open
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            className={isPack ? "flex-1" : "w-full"}
            onClick={() => onInfo(nft)}
          >
            <Info className="mr-1.5 h-4 w-4" />
            Info
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
