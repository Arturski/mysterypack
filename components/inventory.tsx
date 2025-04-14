"use client";

import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchInventory } from "@/lib/api";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

const getRarityStyle = (rarity: string | undefined) => {
  switch (rarity) {
    case "Legendary":
      return "border-4 border-yellow-400 shadow-lg shadow-yellow-400/50";
    case "Rare":
      return "border-4 border-purple-400 shadow-lg shadow-purple-400/50";
    case "Common":
      return "border-4 border-gray-300 shadow shadow-gray-300/50";
    default:
      return "border border-muted shadow";
  }
};

export function Inventory() {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openingPack, setOpeningPack] = useState<NFT | null>(null);
  const [selectedNFTForInfo, setSelectedNFTForInfo] = useState<NFT | null>(
    null
  );
  const [showCards, setShowCards] = useState(false);
  const [revealedAliens, setRevealedAliens] = useState<NFT[]>([]);
  const [filter, setFilter] = useState<FilterType>("all");
  const [burningTokenId, setBurningTokenId] = useState<string | null>(null);
  const [burnError, setBurnError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const { walletAddress } = useContext(EIP1193Context);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { burnNFT } = useBurnNFT({
    contractAddress: "0xb001670b074140aa6942fbf62539562c65843719",
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await fetchInventory(walletAddress);
      setNfts(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredNfts = nfts.filter((nft) => {
    if (filter === "all") return true;
    if (filter === "packs") return nft.collection === "pack";
    if (filter === "aliens") return nft.collection === "alien";
    return true;
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

  const handleVideoEnded = () => {
    setShowCards(true);
  };

  const handleOpenPack = async (nft: NFT) => {
    setOpeningPack(nft);
    setShowCards(false);
    setRevealedAliens([]);
    setBurningTokenId(nft.token_id);
    setBurnError(null);
    setIsVideoReady(false);

    const alienContract = "0x0b0c90da7d6c8a170cf3ef8e9f4ebe53682d3671";
    const fromTimestamp = new Date().toISOString();

    try {
      const burnTx = await burnNFT(nft.token_id);
      if (!burnTx) throw new Error("Burn failed");

      setIsVideoReady(true);
      setTimeout(() => videoRef.current?.play(), 300);

      const newAliens = await pollForNewAliens(
        walletAddress,
        alienContract,
        fromTimestamp
      );
      setRevealedAliens(newAliens);
      setNfts((prev) => prev.filter((n) => n.token_id !== nft.token_id));
    } catch (err: any) {
      console.error("Open pack error:", err);
      setBurnError(err.message || "Failed to open pack");
    } finally {
      setBurningTokenId(null);
    }
  };

  const handlePackModalClose = () => {
    setOpeningPack(null);
    loadInventory();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-row gap-4 items-center">
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
        <Button variant="outline" onClick={loadInventory}>
          🔄 Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredNfts.map((nft) => {
          const rarity = nft.attributes?.find(
            (a) => a.trait_type === "Rarity"
          )?.value;
          return (
            <Card
              key={nft.token_id}
              className={`relative ${getRarityStyle(rarity)}`}
            >
              {parseInt(nft.balance) > 1 && (
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full shadow-md z-10">
                  x{nft.balance}
                </div>
              )}
              <CardContent>
                <img
                  src={nft.image || "/placeholder.svg"}
                  alt={nft.name}
                  className="w-full h-full object-cover rounded mb-2"
                />
                <p className="font-semibold mb-1 text-center">{nft.name}</p>
                {rarity && (
                  <p className="text-xs text-center text-muted-foreground">
                    {rarity}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  {nft.collection === "pack" && nft.token_id === "1" && (
                    <Button
                      className="w-full"
                      onClick={() => handleOpenPack(nft)}
                    >
                      🎁 Open Pack
                    </Button>
                  )}
                  {nft.collection === "alien" && (
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setSelectedNFTForInfo(nft)}
                    >
                      ℹ️ Info
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={openingPack !== null} onOpenChange={handlePackModalClose}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0">
          {!showCards && isVideoReady ? (
            <div className="relative">
              <video
                ref={videoRef}
                src="https://raw.githubusercontent.com/Arturski/public-static/refs/heads/main/demo/aliens/open-pack.mp4"
                className="w-full max-h-[400px] object-cover"
                playsInline
                muted
                autoPlay
                loop={false}
                controls={false}
                key={openingPack?.token_id}
                onEnded={handleVideoEnded}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 p-4 rounded-lg text-white">
                  <p className="animate-pulse text-center">
                    🚀 Scanning the universe for new aliens...
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <AnimatePresence>
            {showCards && (
              <div className="p-8 bg-background">
                <div className="grid grid-cols-3 gap-4">
                  {revealedAliens.map((alien, index) => {
                    const rarity = alien.attributes?.find(
                      (a) => a.trait_type === "Rarity"
                    )?.value;
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

      <Dialog
        open={selectedNFTForInfo !== null}
        onOpenChange={() => setSelectedNFTForInfo(null)}
      >
        <DialogContent className="max-w-lg p-6 space-y-4">
          {selectedNFTForInfo && (
            <>
              <DialogTitle>{selectedNFTForInfo.name}</DialogTitle>
              <img
                src={selectedNFTForInfo.image}
                alt={selectedNFTForInfo.name}
                className="w-full h-auto rounded"
              />
              <p className="text-sm text-muted-foreground">
                {selectedNFTForInfo.description}
              </p>
              <div className="text-sm">
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
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
