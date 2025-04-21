"use client";

import { useState, useEffect, useRef, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

import { fetchInventory } from "@/lib/api";
import { useBurnNFT } from "@/hooks/use-burn-nft";
import { EIP1193Context } from "@/app/context/EIP1193Context";

import { InventoryCard } from "./inventory-card";
import { AlienRevealModal } from "./alien-reveal-modal";
import { NFTInfo } from "./nft-info";

import type { NFT } from "@/types/nft";

const rarityOrder: Record<string, number> = {
  Mythical: 1,
  Legendary: 2,
  Rare: 3,
  Common: 4,
  Unknown: 5,
};

const getRarity = (nft: NFT): string =>
  nft.attributes?.find((attr: any) => attr.trait_type === "Rarity")?.value ??
  "Unknown";

export function Inventory() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [filter, setFilter] = useState<"all" | "packs" | "aliens">("all");
  const [sort, setSort] = useState<"rarityAsc" | "rarityDesc">("rarityDesc");
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [openingPack, setOpeningPack] = useState<NFT | null>(null);
  const [revealedAliens, setRevealedAliens] = useState<NFT[]>([]);
  const [showCards, setShowCards] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { walletAddress } = useContext(EIP1193Context);

  const { burnNFT } = useBurnNFT({
    contractAddress: process.env.NEXT_PUBLIC_SPECIALS_CONTRACT_ADDRESS || "",
  });

  const loadInventory = async () => {
    if (!walletAddress) return;
    const data = await fetchInventory(walletAddress);
    setNfts(data || []);
  };

  useEffect(() => {
    if (walletAddress) loadInventory();
  }, [walletAddress]);

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

  const pollForNewAliens = async (
    walletAddress: string,
    contractAddress: string,
    fromTimestamp: string,
    maxTries = 60,
    delayMs = 500
  ): Promise<NFT[]> => {
    for (let tries = 0; tries < maxTries; tries++) {
      try {
        const { data } = await axios.get(
          `https://api.sandbox.immutable.com/v1/chains/imtbl-zkevm-testnet/accounts/${walletAddress}/nfts`,
          {
            params: {
              contract_address: contractAddress,
              from_updated_at: fromTimestamp,
            },
            headers: { Accept: "application/json" },
          }
        );
        if (data.result?.length >= 3) return data.result.slice(0, 3);
      } catch (err) {
        console.error("Error polling for NFTs:", err);
      }
      await new Promise((res) => setTimeout(res, delayMs));
    }
    return [];
  };

  const handleOpenPack = async (nft: NFT) => {
    setOpeningPack(nft);
    setShowCards(false);
    setRevealedAliens([]);

    const fromTimestamp = new Date().toISOString();
    const alienContract = process.env.NEXT_PUBLIC_ALIEN_CONTRACT_ADDRESS || "";

    videoRef.current?.play();

    try {
      await burnNFT(nft.token_id);
      const newAliens = await pollForNewAliens(
        walletAddress!,
        alienContract,
        fromTimestamp
      );
      setRevealedAliens(newAliens);
      setShowCards(true);
      setNfts((prev) => prev.filter((n) => n.token_id !== nft.token_id));
    } catch (err) {
      console.error("Error opening pack:", err);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap md:flex-nowrap gap-4 items-center">
        <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All NFTs</SelectItem>
            <SelectItem value="packs">Special Items</SelectItem>
            <SelectItem value="aliens">Aliens</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as any)}>
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

      {/* NFT Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredSortedNfts.map((nft) => (
          <InventoryCard
            key={nft.token_id}
            nft={nft}
            rarity={getRarity(nft)}
            onOpen={() => handleOpenPack(nft)}
            onInfo={() => setSelectedNFT(nft)}
          />
        ))}
      </div>

      {/* Pack Opening Modal */}
      <AlienRevealModal
        open={!!openingPack}
        onClose={() => setOpeningPack(null)}
        showCards={showCards}
        revealedAliens={revealedAliens}
        videoRef={videoRef}
      />

      {/* NFT Info Modal */}
      {selectedNFT && (
        <Dialog open={!!selectedNFT} onOpenChange={() => setSelectedNFT(null)}>
          <DialogContent className="max-w-2xl p-6 space-y-4">
            <NFTInfo nft={selectedNFT} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
