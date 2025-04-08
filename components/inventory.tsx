"use client";

import { useState, useEffect, useRef } from "react";
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

interface NFT {
  token_id: string;
  name: string;
  image: string;
  description: string;
  balance: string;
  collection: "pack" | "alien";
  contractAddress: string;
}

type FilterType = "all" | "packs" | "aliens";

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
      const data = await fetchInventory();
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

  const handleOpenPack = async (nft: NFT) => {
    setOpeningPack(nft);
    setShowCards(false);
    setRevealedAliens([]);
    setBurningTokenId(nft.token_id);
    setBurnError(null);

    const userAddress = nfts[0]?.contractAddress;
    const alienContract = "0x0b0c90da7d6c8a170cf3ef8e9f4ebe53682d3671";
    const fromTimestamp = new Date().toISOString();

    try {
      const burnTx = await burnNFT(nft.token_id);
      if (!burnTx) throw new Error("Burn failed");

      setTimeout(() => {
        videoRef.current?.play();
      }, 100);

      const newAliens = await pollForNewAliens(
        userAddress,
        alienContract,
        fromTimestamp
      );

      setRevealedAliens(newAliens);
      setShowCards(true);
      setNfts((prev) => prev.filter((n) => n.token_id !== nft.token_id));
    } catch (err: any) {
      console.error("Open pack error:", err);
      setBurnError(err.message || "Failed to open pack");
    } finally {
      setBurningTokenId(null);
    }
  };

  return (
    <>
      <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle>
            Your Alien Invasion NFTs ({filteredNfts.length})
          </CardTitle>
          <Select
            value={filter}
            onValueChange={(value: FilterType) => setFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All NFTs</SelectItem>
              <SelectItem value="packs">Mystery Packs</SelectItem>
              <SelectItem value="aliens">Aliens</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredNfts.map((nft) => (
              <Card key={nft.token_id}>
                <CardContent>
                  <img
                    src={nft.image || "/placeholder.svg"}
                    alt={nft.name}
                    className="w-full h-full object-cover rounded mb-2"
                  />
                  <p className="font-semibold">{nft.name}</p>

                  {nft.collection === "pack" && (
                    <Button
                      className="mt-2"
                      onClick={() => handleOpenPack(nft)}
                    >
                      🎁 Open Pack
                    </Button>
                  )}

                  {nft.collection === "alien" && (
                    <Button
                      variant="secondary"
                      className="mt-2"
                      onClick={() => setSelectedNFTForInfo(nft)}
                    >
                      ℹ️ Info
                    </Button>
                  )}

                  {burnError && burningTokenId === nft.token_id && (
                    <p className="text-red-500 text-sm mt-2">{burnError}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={openingPack !== null}
        onOpenChange={() => setOpeningPack(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black border-0">
          {!showCards && (
            <video
              ref={videoRef}
              src="https://raw.githubusercontent.com/Arturski/public-static/refs/heads/main/demo/aliens/open-pack.mp4"
              className="w-full h-full"
              playsInline
              muted
              autoPlay
              loop={false}
              controls={false}
              key={openingPack?.token_id}
            />
          )}
          <AnimatePresence>
            {showCards && (
              <div className="p-8 bg-background">
                <div className="grid grid-cols-3 gap-4">
                  {revealedAliens.map((alien, index) => (
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
                      <Card className="bg-secondary/50 backdrop-blur-sm border-primary/20">
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
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
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
        <DialogContent className="max-w-lg p-6">
          {selectedNFTForInfo && (
            <>
              <DialogTitle>{selectedNFTForInfo.name}</DialogTitle>
              <img
                src={selectedNFTForInfo.image}
                alt={selectedNFTForInfo.name}
                className="w-full h-auto rounded my-4"
              />
              <p className="text-sm text-muted-foreground mb-2">
                {selectedNFTForInfo.description}
              </p>
              <div className="space-y-1 text-sm">
                <Label>Token ID:</Label>
                <p>{selectedNFTForInfo.token_id}</p>
                <Label>Collection:</Label>
                <p>{selectedNFTForInfo.collection}</p>
                <Label>Contract Address:</Label>
                <p className="break-all">
                  {selectedNFTForInfo.contractAddress}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
