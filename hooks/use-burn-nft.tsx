"use client";

import { useState, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import { passportInstance } from "@/lib/immutable-passport-client";

interface BurnNFTParams {
  contractAddress: string;
}

export function useBurnNFT({ contractAddress }: BurnNFTParams) {
  const [isBurning, setIsBurning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  useEffect(() => {
    const connectPassport = async () => {
      try {
        const passportProvider = await passportInstance.connectEvm(); // EIP-1193 provider
        const ethersProvider = new BrowserProvider(passportProvider); // ethers v6
        setProvider(ethersProvider);
      } catch (err) {
        console.error("❌ Error connecting to Passport:", err);
        setError("Failed to connect to Passport");
      }
    };
    connectPassport();
  }, []);

  const burnNFT = async (tokenId: string) => {
    if (!provider) {
      setError("Provider is not available");
      return;
    }

    setIsBurning(true);
    setError(null);

    try {
      const signer = await provider.getSigner();
      const sender = await signer.getAddress();

      const contract = new Contract(
        contractAddress,
        ["function burn(address account, uint256 id, uint256 value)"],
        signer
      );

      console.log("🔥 Burning token...");
      console.log("account:", sender, "id:", tokenId, "value: 1");

      const tx = await contract.burn(sender, BigInt(tokenId), BigInt(1));
      console.log("📨 Transaction sent. Waiting for confirmation:", tx.hash);
      await provider.waitForTransaction(tx.hash);

      console.log("✅ Burn successful:", tx.hash);
      return tx.hash;
    } catch (err: any) {
      console.error("❌ Error burning NFT:", err);
      setError(err.message || "Unknown error");
    } finally {
      setIsBurning(false);
    }
  };

  return { burnNFT, isBurning, error };
}
