"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getRarity, getRarityGlow, getRarityText } from "@/lib/rarity";
import type { NFT } from "@/types/nft";

interface NFTInfoDialogProps {
  nft: NFT | null;
  onClose: () => void;
}

export function NFTInfoDialog({ nft, onClose }: NFTInfoDialogProps) {
  if (!nft) return null;
  const rarity = getRarity(nft);

  return (
    <Dialog open={!!nft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <div className="flex flex-col gap-6 md:flex-row">
          <div
            className={cn(
              "shrink-0 self-center overflow-hidden rounded-lg border-2",
              getRarityGlow(rarity)
            )}
          >
            <img
              src={nft.image || "/placeholder.svg"}
              alt={nft.name}
              className="h-48 w-48 object-cover md:h-56 md:w-56"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <DialogTitle className="font-heading text-xl">
                {nft.name}
              </DialogTitle>
              <p className={cn("text-sm font-medium", getRarityText(rarity))}>
                {rarity}
              </p>
            </div>

            {nft.description && (
              <p className="text-sm text-muted-foreground">{nft.description}</p>
            )}

            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Token ID</dt>
              <dd className="font-mono">{nft.token_id}</dd>
              <dt className="text-muted-foreground">Collection</dt>
              <dd className="capitalize">{nft.collection}</dd>
              <dt className="text-muted-foreground">Contract</dt>
              <dd className="break-all font-mono text-xs">
                {nft.contractAddress}
              </dd>
            </dl>

            {nft.attributes && nft.attributes.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-semibold">Attributes</p>
                <div className="grid grid-cols-2 gap-2">
                  {nft.attributes.map((attr, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-border/60 bg-secondary/40 px-3 py-1.5"
                    >
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {attr.trait_type}
                      </p>
                      <p className="text-sm font-medium">{String(attr.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
