"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Boxes, RefreshCw, Wallet } from "lucide-react";
import { fetchInventory } from "@/lib/api";
import { getRarity, rarityOrder } from "@/lib/rarity";
import { useWallet } from "@/app/context/EIP1193Context";
import { usePackOpening } from "@/hooks/use-pack-opening";
import { useToast } from "@/components/ui/use-toast";
import { InventoryCard } from "./inventory-card";
import { NFTInfoDialog } from "./nft-info";
import AlienRevealModal from "./alien-reveal-modal";
import type { NFT } from "@/types/nft";

type FilterType = "all" | "packs" | "aliens";
type SortType = "rarityAsc" | "rarityDesc";

export default function Inventory() {
  const { walletAddress, isConnected } = useWallet();
  const { toast } = useToast();

  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [sort, setSort] = useState<SortType>("rarityDesc");
  const [selectedNFTForInfo, setSelectedNFTForInfo] = useState<NFT | null>(null);

  const { status, revealedAliens, error, openingPack, openPack, reset } =
    usePackOpening();

  const loadInventory = useCallback(async () => {
    if (!walletAddress) return;
    setLoading(true);
    setFetchError(null);
    try {
      const data = await fetchInventory(walletAddress);
      setNfts(data || []);
    } catch (err: any) {
      setFetchError(err?.message || "Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (walletAddress) loadInventory();
    else setNfts([]);
  }, [walletAddress, loadInventory]);

  // Toast feedback as the pack-opening flow progresses.
  useEffect(() => {
    if (status === "revealing") {
      toast({
        title: "Pack burned",
        description: "Scanning the universe for your new aliens…",
      });
    } else if (status === "error" && error) {
      toast({
        title: "Pack opening failed",
        description: error,
        variant: "destructive",
      });
    }
  }, [status, error, toast]);

  const handleCloseReveal = useCallback(() => {
    reset();
    loadInventory();
  }, [reset, loadInventory]);

  const handleRetry = useCallback(() => {
    if (openingPack) openPack(openingPack);
  }, [openingPack, openPack]);

  const filteredSortedNfts = nfts
    .filter((nft) => {
      if (filter === "packs") return nft.collection === "pack";
      if (filter === "aliens") return nft.collection === "alien";
      return true;
    })
    .sort((a, b) => {
      const ra = rarityOrder[getRarity(a)];
      const rb = rarityOrder[getRarity(b)];
      return sort === "rarityAsc" ? ra - rb : rb - ra;
    });

  // --- Empty / loading / error states ---

  if (!isConnected) {
    return (
      <EmptyState
        icon={<Wallet className="h-10 w-10 text-primary" />}
        title="Connect your wallet"
        description="Connect with Immutable Passport to view and open your Mystery Packs."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={filter} onValueChange={(v: FilterType) => setFilter(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All NFTs</SelectItem>
            <SelectItem value="packs">Special Items</SelectItem>
            <SelectItem value="aliens">Aliens</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sort} onValueChange={(v: SortType) => setSort(v)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rarityDesc">Rarity: high → low</SelectItem>
            <SelectItem value="rarityAsc">Rarity: low → high</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={loadInventory}
          disabled={loading}
          className="ml-auto"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {loading && nfts.length === 0 ? (
        <InventorySkeleton />
      ) : fetchError ? (
        <EmptyState
          icon={<AlertTriangle className="h-10 w-10 text-destructive" />}
          title="Couldn't load inventory"
          description={fetchError}
          action={
            <Button onClick={loadInventory}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          }
        />
      ) : filteredSortedNfts.length === 0 ? (
        <EmptyState
          icon={<Boxes className="h-10 w-10 text-muted-foreground" />}
          title="Nothing here yet"
          description="Mint a Mystery Pack to get started, then open it to reveal your aliens."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredSortedNfts.map((nft) => (
            <InventoryCard
              key={`${nft.contractAddress}-${nft.token_id}`}
              nft={nft}
              onOpen={() => openPack(nft)}
              onInfo={() => setSelectedNFTForInfo(nft)}
            />
          ))}
        </div>
      )}

      <AlienRevealModal
        status={status}
        revealedAliens={revealedAliens}
        error={error}
        onClose={handleCloseReveal}
        onRetry={handleRetry}
      />

      <NFTInfoDialog
        nft={selectedNFTForInfo}
        onClose={() => setSelectedNFTForInfo(null)}
      />
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border/60 bg-card/40 px-6 py-16 text-center">
      <div className="rounded-full bg-secondary/60 p-4">{icon}</div>
      <h3 className="font-heading text-lg font-semibold">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

function InventorySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-lg border border-border/50 p-3">
          <Skeleton className="aspect-square w-full rounded-md" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}
