"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [showCards, setShowCards] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const [burningTokenId, setBurningTokenId] = useState<string | null>(null);
  const [burnError, setBurnError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { burnNFT, isBurning } = useBurnNFT({
    contractAddress: "0xb001670b074140aa6942fbf62539562c65843719", // ✅ Replace with your actual contract address
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

  const handleOpenPack = (nft: NFT) => {
    setShowCards(false);
    setOpeningPack(nft);
  };

  const handleBurnPack = async (nft: NFT) => {
    setBurningTokenId(nft.token_id);
    setBurnError(null);
    try {
      const burnTx = await burnNFT(nft.token_id);
      if (burnTx) {
        console.log("🔥 Burned NFT", burnTx);
        // Optionally remove from local list:
        setNfts((prev) => prev.filter((n) => n.token_id !== nft.token_id));
      }
    } catch (err: any) {
      console.error("Burn failed:", err);
      setBurnError(err.message || "Burn failed");
    } finally {
      setBurningTokenId(null);
    }
  };

  const handleVideoEnded = () => {
    setShowCards(true);
  };

  const handleDialogClose = () => {
    setOpeningPack(null);
    setShowCards(false);
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
                    className="w-full h-full object-cover rounded"
                  />
                  <p>{nft.name}</p>
                  <Button className="mb-2" onClick={() => handleOpenPack(nft)}>
                    Open Pack
                  </Button>

                  {nft.collection === "pack" && (
                    <Button
                      variant="destructive"
                      disabled={burningTokenId !== null}
                      onClick={() => handleBurnPack(nft)}
                    >
                      {burningTokenId === nft.token_id
                        ? "Burning..."
                        : "🔥 Burn"}
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

      <Dialog open={openingPack !== null} onOpenChange={handleDialogClose}>
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
              onEnded={handleVideoEnded}
              key={openingPack?.token_id}
            />
          )}
          <AnimatePresence>
            {showCards && (
              <div className="p-8 bg-background">
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map((_, index) => (
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
                              src="/placeholder.svg?height=200&width=200"
                              alt="Alien Placeholder"
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <p className="text-sm font-semibold text-center">
                            Alien #{index + 1}
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
    </>
  );
}
