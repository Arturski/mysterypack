"use client";

import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { RefObject } from "react";
import { NFT } from "@/types/nft"; // make sure this path is correct

interface Props {
  nft: NFT | null;
  videoRef: RefObject<HTMLVideoElement | null>;
  showCards: boolean;
  revealedAliens: NFT[];
  setRevealedAliens: React.Dispatch<React.SetStateAction<NFT[]>>;
  setShowCards: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}

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

export default function AlienRevealModal({
  nft,
  videoRef,
  showCards,
  revealedAliens,
  setRevealedAliens,
  setShowCards,
  onClose,
}: Props) {
  return (
    <AnimatePresence>
      {showCards ? (
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
      ) : (
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
    </AnimatePresence>
  );
}
