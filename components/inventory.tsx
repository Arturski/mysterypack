"use client";

import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { fetchInventory } from "@/lib/api";
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

export function Inventory() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("rarityDesc");
  const [openingPack, setOpeningPack] = useState<NFT | null>(null);
  const [selectedNFTForInfo, setSelectedNFTForInfo] = useState<NFT | null>(
    null
  );
  const [revealedAliens, setRevealedAliens] = useState<NFT[]>([]);
  const [showCards, setShowCards] = useState(false);
  const { walletAddress } = useContext(EIP1193Context);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { burnNFT } = useBurnNFT({
    contractAddress: process.env.NEXT_PUBLIC_SPECIALS_CONTRACT_ADDRESS || "",
  });

  useEffect(() => {
    if (walletAddress) loadInventory();
  }, [walletAddress]);

  const loadInventory = async () => {
    if (!walletAddress) return;
    const data = await fetchInventory(walletAddress);
    setNfts(data || []);
  };

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

      {/* NFT Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredSortedNfts.map((nft) => {
          const rarity = getRarity(nft);
          return (
            <Card
              key={nft.token_id}
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
                  <p className="text-xs text-center text-muted-foreground">
                    {rarity}
                  </p>
                </div>
                <div className="flex gap-x-2 mt-4">
                  {nft.collection === "pack" && (
                    <Button
                      className="flex-1"
                      onClick={() => handleOpenPack(nft)}
                    >
                      🎁 Open
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setSelectedNFTForInfo(nft)}
                  >
                    ℹ️ Info
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Open Pack Modal */}
      <Dialog open={!!openingPack} onOpenChange={() => setOpeningPack(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0">
          {!showCards && (
            <div className="relative">
              <video
                ref={videoRef}
                src="https://raw.githubusercontent.com/Arturski/public-static/main/demo/aliens/open-pack.mp4"
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
                            <div className="aspect-square bg-secondary rounded mb-2 flex items-center justify-center">
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

      {/* NFT Info Dialog */}
      <Dialog
        open={!!selectedNFTForInfo}
        onOpenChange={() => setSelectedNFTForInfo(null)}
      >
        <DialogContent className="max-w-2xl p-6 space-y-4">
          {selectedNFTForInfo && (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 overflow-y-auto max-h-[400px] pr-4">
                <DialogTitle>{selectedNFTForInfo.name}</DialogTitle>
                <p className="text-sm text-muted-foreground mb-2">
                  {selectedNFTForInfo.description}
                </p>
                <Label className="font-semibold">Token ID:</Label>
                <p className="mb-2">{selectedNFTForInfo.token_id}</p>
                <Label className="font-semibold">Collection:</Label>
                <p className="mb-2">{selectedNFTForInfo.collection}</p>
                <Label className="font-semibold">Contract Address:</Label>
                <p className="mb-2 break-all">
                  {selectedNFTForInfo.contractAddress}
                </p>
                {selectedNFTForInfo.attributes && (
                  <div className="mt-4">
                    <Label className="font-semibold mb-2 block">
                      Attributes
                    </Label>
                    <table className="w-full text-sm border border-muted rounded overflow-hidden">
                      <thead>
                        <tr className="bg-muted">
                          <th className="text-left px-2 py-1">Trait</th>
                          <th className="text-left px-2 py-1">Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedNFTForInfo.attributes.map((attr, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-2 py-1">{attr.trait_type}</td>
                            <td className="px-2 py-1">{String(attr.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={selectedNFTForInfo.image}
                  alt={selectedNFTForInfo.name}
                  className="w-full h-auto rounded max-h-[400px] object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
