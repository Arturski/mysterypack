"use client";

import { useCallback, useRef, useState } from "react";
import { useWallet } from "@/app/context/EIP1193Context";
import { useBurnNFT } from "@/hooks/use-burn-nft";
import { fetchInventory } from "@/lib/api";
import { SPECIALS_CONTRACT_ADDRESS } from "@/lib/constants";
import type { NFT } from "@/types/nft";

export type PackOpeningStatus =
  | "idle"
  | "burning"
  | "revealing"
  | "done"
  | "error";

const POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 12; // ~48s before giving up
const EXPECTED_ALIENS = 3;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Orchestrates the full pack-opening flow:
 *   burn the pack on-chain -> poll the Immutable API for the aliens the
 *   webhook mints in response -> surface them for the reveal animation.
 */
export function usePackOpening() {
  const { walletAddress } = useWallet();
  const { burnNFT } = useBurnNFT({
    contractAddress: SPECIALS_CONTRACT_ADDRESS,
  });

  const [status, setStatus] = useState<PackOpeningStatus>("idle");
  const [revealedAliens, setRevealedAliens] = useState<NFT[]>([]);
  const [error, setError] = useState<string | null>(null);
  const openingPackRef = useRef<NFT | null>(null);

  const reset = useCallback(() => {
    setStatus("idle");
    setRevealedAliens([]);
    setError(null);
    openingPackRef.current = null;
  }, []);

  const openPack = useCallback(
    async (pack: NFT) => {
      if (!walletAddress) {
        setError("Connect your wallet to open packs.");
        setStatus("error");
        return;
      }

      openingPackRef.current = pack;
      setError(null);
      setRevealedAliens([]);
      setStatus("burning");

      // Snapshot existing alien ids so we can detect only the newly minted ones.
      let beforeIds = new Set<string>();
      try {
        const before = await fetchInventory(walletAddress);
        beforeIds = new Set(
          before
            .filter((n) => n.collection === "alien")
            .map((n) => n.token_id)
        );
      } catch {
        // Non-fatal: if the pre-burn snapshot fails we still reveal whatever is new.
      }

      // 1. Burn the pack on-chain.
      try {
        await burnNFT(pack.token_id);
      } catch (err: any) {
        setError(err?.message || "Failed to burn pack.");
        setStatus("error");
        return;
      }

      // 2. Poll for the aliens the backend webhook mints in response to the burn.
      setStatus("revealing");
      let latestFresh: NFT[] = [];
      for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
        await sleep(POLL_INTERVAL_MS);
        try {
          const current = await fetchInventory(walletAddress);
          const fresh = current.filter(
            (n) => n.collection === "alien" && !beforeIds.has(n.token_id)
          );
          if (fresh.length >= EXPECTED_ALIENS) {
            setRevealedAliens(fresh.slice(0, EXPECTED_ALIENS));
            setStatus("done");
            return;
          }
          // Partial arrival — keep the latest set in case we time out.
          if (fresh.length > 0) {
            latestFresh = fresh;
            setRevealedAliens(fresh);
          }
        } catch {
          // transient API error — keep polling
        }
      }

      // 3. Timed out. Reveal whatever arrived, else surface an error.
      if (latestFresh.length > 0) {
        setStatus("done");
      } else {
        setError(
          "Your aliens are still being minted. Check your inventory again shortly."
        );
        setStatus("error");
      }
    },
    [walletAddress, burnNFT]
  );

  return {
    status,
    revealedAliens,
    error,
    openingPack: openingPackRef.current,
    openPack,
    reset,
  };
}
