"use client";

import { useCallback, useState } from "react";
import { Contract } from "ethers";
import { useWallet } from "@/app/context/EIP1193Context";

const BURN_ABI = ["function burn(address account, uint256 id, uint256 value)"];

interface UseBurnNFTParams {
  contractAddress: string;
}

/**
 * Burns one unit of an ERC-1155 token from the connected wallet, using the
 * shared provider from EIP1193Context. Returns the tx hash on success.
 */
export function useBurnNFT({ contractAddress }: UseBurnNFTParams) {
  const { provider } = useWallet();
  const [isBurning, setIsBurning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const burnNFT = useCallback(
    async (tokenId: string): Promise<string> => {
      if (!provider) {
        const message = "Wallet provider not available. Connect your wallet.";
        setError(message);
        throw new Error(message);
      }

      setIsBurning(true);
      setError(null);
      try {
        const signer = await provider.getSigner();
        const sender = await signer.getAddress();
        const contract = new Contract(contractAddress, BURN_ABI, signer);

        const tx = await contract.burn(sender, BigInt(tokenId), BigInt(1));
        await provider.waitForTransaction(tx.hash);
        return tx.hash as string;
      } catch (err: any) {
        const message = err?.shortMessage || err?.message || "Burn failed";
        setError(message);
        throw new Error(message);
      } finally {
        setIsBurning(false);
      }
    },
    [provider, contractAddress]
  );

  return { burnNFT, isBurning, error };
}
