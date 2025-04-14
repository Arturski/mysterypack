"use client";

import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { fetchInventory } from "@/lib/api";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBurnNFT } from "@/hooks/use-burn-nft";
import { Label } from "@/components/ui/label";
import { EIP1193Context } from "@/app/context/EIP1193Context";

interface NFT {
  token_id: string;
  name: string;
  image: string;
  description: string;
  balance: string;
  collection: "pack" | "alien";
  contractAddress: string;
  attributes?: { trait_type: string; value: string }[];
}

type FilterType = "all" | "packs" | "aliens";
type SortType = "rarityAsc" | "rarityDesc";

const rarityOrder: Record<string, number> = {
  Mythical: 1,
  Legendary: 2,
  Rare: 3,
  Common: 4,
  Unknown: 5,
};

const getRarity = (nft: NFT): string => {
  return (
    nft.attributes?.find((attr) => attr.trait_type === "Rarity")?.value ??
    "Unknown"
  );
};

const getRarityStyle = (rarity: string | undefined) => {
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

export function Inventory() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("rarityDesc");
  const [openingPack, setOpeningPack] = useState<NFT | null>(null);
  const [revealedAliens, setRevealedAliens] = useState<NFT[]>([]);
  const [showCards, setShowCards] = useState(false);
  const { walletAddress } = useContext(EIP1193Context);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { burnNFT } = useBurnNFT({
    contractAddress: "0xb001670b074140aa6942fbf62539562c65843719",
  });

  useEffect(() => {
    const loadInventory = async () => {
      const data = await fetchInventory(walletAddress);
      setNfts(data || []);
    };
    loadInventory();
  }, [walletAddress]);

  const filteredSortedNfts = nfts
    .filter((nft) => {
      if (filter === "all") return true;
      if (filter === "packs") return nft.collection === "pack";
      if (filter === "aliens") return nft.collection === "alien";
      return true;
    })
    .sort((a, b) => {
      const rarityA = rarityOrder[getRarity(a)] || rarityOrder.Unknown;
      const rarityB = rarityOrder[getRarity(b)] || rarityOrder.Unknown;
      return sort === "rarityAsc" ? rarityA - rarityB : rarityB - rarityA;
    });

  const pollForNewAliens = async (
    walletAddress: string,
    contractAddress: string,
    fromTimestamp: string,
    maxTries = 30,
    delayMs = 2000
  ): Promise<NFT[]> => {
    let tries = 0;
    while (tries < maxTries) {
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
      tries++;
    }
    return [];
  };

  const handleOpenPack = async (nft: NFT) => {
    setOpeningPack(nft);
    setShowCards(false);
    setRevealedAliens([]);

    const alienContract = "0x0b0c90da7d6c8a170cf3ef8e9f4ebe53682d3671";
    const fromTimestamp = new Date().toISOString();

    videoRef.current?.play();

    try {
      await burnNFT(nft.token_id);
      const newAliens = await pollForNewAliens(
        walletAddress,
        alienContract,
        fromTimestamp
      );
      setRevealedAliens(newAliens);
      setShowCards(true);
    } catch (err) {
      console.error("Error opening pack:", err);
    }
  };

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
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredSortedNfts.map((nft) => {
          const rarity = getRarity(nft);
          return (
            <Card
              key={nft.token_id}
              className={`relative ${getRarityStyle(rarity)}`}
            >
              <CardContent>
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.name}
                  className="w-full h-full object-cover rounded mb-2"
                />
                <p className="font-semibold mb-1 text-center">{nft.name}</p>
                <p className="text-xs text-center text-muted-foreground">
                  {rarity}
                </p>
                {nft.collection === "pack" && nft.token_id === "1" && (
                  <Button
                    className="w-full mt-2"
                    onClick={() => handleOpenPack(nft)}
                  >
                    🎁 Open Pack
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!openingPack} onOpenChange={() => setOpeningPack(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0">
          {!showCards && (
            <div className="relative">
              <video
                ref={videoRef}
                src="https://raw.githubusercontent.com/Arturski/public-static/refs/heads/main/demo/aliens/open-pack.mp4"
                className="w-full aspect-video object-contain max-h-[400px]"
                playsInline
                muted
                autoPlay
                loop
                controls={false}
              />
              <div className="absolute inset-0 flex items-end justify-center pb-8">
                <div className="bg-black/50 p-4 rounded-lg text-white">
                  <p className="animate-pulse text-center">
                    🚀 Scanning the universe for new aliens...
                  </p>
                </div>
              </div>
            </div>
          )}

          <AnimatePresence>
            {showCards && (
              <div className="p-8 bg-background">
                <div className="grid grid-cols-3 gap-4">
                  {revealedAliens.map((alien, index) => {
                    const rarity = getRarity(alien);
                    return (
                      <motion.div
                        key={index}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: index * 0.2,
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
                        }}
                      >
                        <Card
                          className={`bg-secondary/50 backdrop-blur-sm ${getRarityStyle(
                            rarity
                          )}`}
                        >
                          <CardContent className="p-3">
                            <div className="aspect-square rounded bg-secondary flex items-center justify-center mb-2">
                              <img
                                src={alien.image || "/placeholder.svg"}
                                alt={alien.name}
                                className="w-full h-full object-cover rounded"
                              />
                            </div>
                            <p className="text-sm font-semibold text-center">
                              {alien.name}
                            </p>
                            <p className="text-xs text-center text-muted-foreground mt-1">
                              {rarity || "Unknown Rarity"}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
}
