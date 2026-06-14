"use client";

import { useState, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mintAsset } from "@/lib/api";
import { useWallet } from "@/app/context/EIP1193Context";
import { useToast } from "@/components/ui/use-toast";
import { MintSuccessDialog } from "./mint-success-dialog";

interface MintCardProps {
  title: string;
  description: string;
  tokenId: string;
  icon: ReactNode;
  image?: string;
  badge?: string;
  ctaLabel: string;
  variant?: "default" | "secondary";
  accentClass?: string;
  successTitle: string;
  successDescription: string;
}

export function MintCard({
  title,
  description,
  tokenId,
  icon,
  image,
  badge,
  ctaLabel,
  variant = "default",
  accentClass = "border-primary/30",
  successTitle,
  successDescription,
}: MintCardProps) {
  const { walletAddress, isConnected } = useWallet();
  const { toast } = useToast();
  const [isMinting, setIsMinting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleMint = async () => {
    if (!isConnected) {
      toast({
        title: "No wallet connected",
        description: "Connect your wallet to mint.",
        variant: "destructive",
      });
      return;
    }
    setIsMinting(true);
    try {
      await mintAsset(walletAddress, tokenId);
      setShowSuccess(true);
    } catch (error: any) {
      toast({
        title: "Mint failed",
        description: error?.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <>
      <Card className={cn("flex flex-col overflow-hidden bg-card/70", accentClass)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 font-heading tracking-wide">
              {icon}
              {title}
            </CardTitle>
            {badge && (
              <span className="rounded-full border border-border/60 bg-secondary/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {badge}
              </span>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <div className="relative mx-auto aspect-square w-full max-w-[260px] overflow-hidden rounded-lg border border-border/50 bg-secondary/40">
            {image ? (
              <img
                src={image}
                alt={title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-accent">
                <div className="scale-[3] opacity-80">{icon}</div>
              </div>
            )}
          </div>
          <Button
            onClick={handleMint}
            disabled={isMinting}
            size="lg"
            variant={variant}
            className="mt-auto w-full"
          >
            {isMinting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isMinting ? "Minting…" : ctaLabel}
          </Button>
        </CardContent>
      </Card>

      <MintSuccessDialog
        open={showSuccess}
        onOpenChange={setShowSuccess}
        title={successTitle}
        description={successDescription}
      />
    </>
  );
}
