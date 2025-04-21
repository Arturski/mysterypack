"use client";

import { useState, useContext } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MintSuccessDialog } from "./mint-success-dialog";
import { EIP1193Context } from "@/app/context/EIP1193Context";
import { useToast } from "@/components/ui/use-toast";
import { mintAsset } from "@/lib/api";
import { VIP_PASS_TOKEN_ID } from "@/lib/constants";

export function MintVipPass() {
  const [isMinting, setIsMinting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { walletAddress } = useContext(EIP1193Context);
  const { toast } = useToast();

  const handleMint = async () => {
    if (!walletAddress) {
      toast({
        title: "No wallet connected",
        description: "Please connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsMinting(true);
    try {
      await mintAsset(walletAddress, VIP_PASS_TOKEN_ID);
      setShowSuccess(true);
    } catch (error: any) {
      toast({
        title: "Mint Failed",
        description: error?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleMint}
        disabled={isMinting}
        className="w-full"
        size="lg"
        variant="secondary"
      >
        <BadgeCheck className="mr-2 h-4 w-4" />
        {isMinting ? "Minting..." : "Mint VIP Pass"}
      </Button>
      <MintSuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title="VIP Pass Minted!"
        description="Your VIP Pass has been minted and added to your wallet."
      />
    </div>
  );
}
