"use client";

import { useState, useContext } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Gift, Package, ExternalLink, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { mintPack } from "@/lib/api";
import { EIP1193Context } from "@/app/context/EIP1193Context";

interface MysteryPackProps {
  onPackMinted?: () => void;
}

export function MysteryPack({ onPackMinted }: MysteryPackProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);
  const { toast } = useToast();
  const { walletAddress } = useContext(EIP1193Context);

  const handleMint = async (tokenId: "1" | "2") => {
    if (!walletAddress) {
      toast({
        title: "No wallet connected",
        description: "Please connect your wallet to mint.",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);
    try {
      await mintPack(walletAddress, tokenId);
      setMintedTokenId(tokenId);
      setShowSuccess(true);
      onPackMinted?.();
    } catch (error) {
      toast({
        title: "Mint Failed",
        description:
          error instanceof Error ? error.message : "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <>
      <Card className="bg-background/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Alien Mystery Pack
          </CardTitle>
          <CardDescription>
            Mint mystery packs containing 3 random aliens or mint a VIP Pass for
            Discord access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="aspect-square max-w-sm mx-auto rounded-lg bg-secondary/50 flex items-center justify-center relative overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(59,130,246,0.2)_360deg)] rounded-lg"
              />
              <img
                src="https://raw.githubusercontent.com/Arturski/public-static/refs/heads/main/demo/aliens/alien-pack-cover.webp"
                alt="Alien Mystery Pack"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                onClick={() => handleMint("1")}
                className="w-full"
                size="lg"
                disabled={isMinting || !walletAddress}
              >
                <Gift className="mr-2 h-4 w-4" />
                {isMinting ? "Minting..." : "Mint Pack"}
              </Button>
              <Button
                onClick={() => handleMint("2")}
                className="w-full"
                size="lg"
                variant="secondary"
                disabled={isMinting || !walletAddress}
              >
                <BadgeCheck className="mr-2 h-4 w-4" />
                {isMinting ? "Minting..." : "Mint VIP Pass"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">🎉</span> Mint Successful!
            </DialogTitle>
            <DialogDescription>
              {mintedTokenId === "1"
                ? "Your Alien Mystery Pack has been minted."
                : "Your VIP Pass has been minted."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <img
                src="https://raw.githubusercontent.com/Arturski/public-static/refs/heads/main/demo/aliens/alien-pack-cover.webp"
                alt="Minted NFT"
                className="w-32 h-32 mx-auto rounded-lg object-cover"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowSuccess(false)}
              >
                Continue Minting
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  const contractAddress =
                    process.env.NEXT_PUBLIC_SPECIALS_CONTRACT_ADDRESS;
                  if (contractAddress) {
                    window.open(
                      `https://play.sandbox.immutable.com/collection/zkEvm/${contractAddress}/`,
                      "_blank"
                    );
                  }
                }}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on Immutable Play
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
