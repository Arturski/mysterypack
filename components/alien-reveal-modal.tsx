"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRarity, getRarityGlow, getRarityText } from "@/lib/rarity";
import type { NFT } from "@/types/nft";
import type { PackOpeningStatus } from "@/hooks/use-pack-opening";

const OPEN_PACK_VIDEO =
  "https://raw.githubusercontent.com/Arturski/public-static/main/demo/aliens/open-pack.mp4";

interface Props {
  status: PackOpeningStatus;
  revealedAliens: NFT[];
  error: string | null;
  onClose: () => void;
  onRetry: () => void;
}

export default function AlienRevealModal({
  status,
  revealedAliens,
  error,
  onClose,
  onRetry,
}: Props) {
  const reduceMotion = useReducedMotion();
  const open = status !== "idle";
  const isBusy = status === "burning" || status === "revealing";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        // Don't allow accidental dismissal while a transaction is in flight.
        if (!next && !isBusy) onClose();
      }}
    >
      <DialogContent className="max-w-2xl border-primary/40">
        {isBusy && (
          <div className="flex flex-col items-center gap-5 py-2 text-center">
            <DialogTitle className="font-heading tracking-wide neon-text">
              {status === "burning" ? "Burning your pack…" : "Revealing aliens…"}
            </DialogTitle>
            <div className="relative w-full overflow-hidden rounded-lg border border-primary/30">
              <video
                src={OPEN_PACK_VIDEO}
                className="aspect-video w-full object-cover"
                playsInline
                muted
                autoPlay
                loop
              />
            </div>
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {status === "burning"
                ? "Confirm the transaction in your wallet…"
                : "Scanning the universe for new aliens…"}
            </p>
          </div>
        )}

        {status === "done" && (
          <div className="space-y-5 py-1">
            <DialogTitle className="text-center font-heading tracking-wide neon-text">
              You revealed {revealedAliens.length} alien
              {revealedAliens.length === 1 ? "" : "s"}!
            </DialogTitle>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {revealedAliens.map((alien, i) => {
                const rarity = getRarity(alien);
                return (
                  <motion.div
                    key={`${alien.token_id}-${i}`}
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, rotateY: 90, scale: 0.85 }
                    }
                    animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                    transition={{
                      delay: reduceMotion ? 0 : i * 0.18,
                      type: "spring",
                      stiffness: 220,
                      damping: 18,
                    }}
                    className={cn(
                      "rounded-lg border-2 bg-card/80 p-3",
                      getRarityGlow(rarity)
                    )}
                  >
                    <div className="mb-2 aspect-square overflow-hidden rounded-md bg-secondary">
                      <img
                        src={alien.image || "/placeholder.svg"}
                        alt={alien.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="truncate text-center text-sm font-semibold">
                      {alien.name}
                    </p>
                    <p
                      className={cn(
                        "text-center text-xs font-medium",
                        getRarityText(rarity)
                      )}
                    >
                      {rarity}
                    </p>
                  </motion.div>
                );
              })}
            </div>
            <Button className="w-full" onClick={onClose}>
              Add to inventory
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive" />
            <DialogTitle className="font-heading tracking-wide">
              Pack opening failed
            </DialogTitle>
            <p className="max-w-sm text-sm text-muted-foreground">
              {error || "Something went wrong while opening your pack."}
            </p>
            <div className="flex w-full gap-3">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Close
              </Button>
              <Button className="flex-1" onClick={onRetry}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Try again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
