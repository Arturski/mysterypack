// components/inventory.tsx

"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { Button } from "@/components/ui/button";
import { fetchInventory } from "@/lib/api";
import { EIP1193Context } from "@/app/context/EIP1193Context";
import { InventoryCard } from "./inventory-card";
import { NFTInfoDialog } from "./nft-info";
import AlienRevealModal from "./alien-reveal-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { NFT } from "@/types/nft";

type FilterType = "all" | "packs" | "aliens";
type SortType = "rarityAsc" | "rarityDesc";

const rarityOrder: Record<string, number> = {
  Mythical: 1,
  Legendary: 2,
  Rare: 3,
  Common: 4,
  Unknown: 5,
};

export default function Inventory() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("rarityDesc");
  const [openingPack, setOpeningPack] = useState<NFT | null>(null);
  const [selectedNFTForInfo, setSelectedNFTForInfo] = useState<NFT | null>(
    null
  );
  const [revealedAliens, setRevealedAliens] = useState<NFT[]>([]);
  const [showCards, setShowCards] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { walletAddress } = useContext(EIP1193Context);

  useEffect(() => {
    if (walletAddress) loadInventory();
  }, [walletAddress]);

  const loadInventory = async () => {
    if (!walletAddress) return;
    const data = await fetchInventory(walletAddress);
    setNfts(data || []);
  };

  const getRarity = (nft: NFT): string =>
    nft.attributes?.find((attr: any) => attr.trait_type === "Rarity")?.value ??
    "Unknown";

  const filteredSortedNfts = nfts
    .filter((nft) => {
      if (filter === "packs") return nft.collection === "pack";
      if (filter === "aliens") return nft.collection === "alien";
      return true;
    })
    .sort((a, b) => {
      const rarityA = rarityOrder[getRarity(a)] ?? rarityOrder.Unknown;
      const rarityB = rarityOrder[getRarity(b)] ?? rarityOrder.Unknown;
      return sort === "rarityAsc" ? rarityA - rarityB : rarityB - rarityA;
    });

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
        <Select value={filter} onValueChange={(v: FilterType) => setFilter(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All NFTs</SelectItem>
            <SelectItem value="packs">Special Items</SelectItem>
            <SelectItem value="aliens">Aliens</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v: SortType) => setSort(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by rarity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rarityDesc">Rarity ↓</SelectItem>
            <SelectItem value="rarityAsc">Rarity ↑</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={loadInventory}>
          🔄 Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredSortedNfts.map((nft) => (
          <InventoryCard
            key={nft.token_id}
            nft={nft}
            onOpen={() => setOpeningPack(nft)}
            onInfo={() => setSelectedNFTForInfo(nft)}
          />
        ))}
      </div>

      <AlienRevealModal
        nft={openingPack}
        videoRef={videoRef}
        setRevealedAliens={setRevealedAliens}
        setShowCards={setShowCards}
        showCards={showCards}
        revealedAliens={revealedAliens}
        onClose={() => setOpeningPack(null)}
      />

      {selectedNFTForInfo && (
        <NFTInfoDialog
          nft={selectedNFTForInfo}
          onClose={() => setSelectedNFTForInfo(null)}
        />
      )}
    </div>
  );
}
