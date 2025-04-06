"use client";

import { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { ImmutableERC721Abi } from "@imtbl/contracts";
import { passportInstance } from "@/app/utils/setupDefault";

interface BurnNFTParams {
  contractAddress: string;
}

export function useBurnNFT({ contractAddress }: BurnNFTParams) {
  const [isBurning, setIsBurning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    const connectPassport = async () => {
      try {
        const passportProvider = await passportInstance.connectEvm();
        setProvider(new ethers.providers.Web3Provider(passportProvider));
      } catch (error) {
        console.error("Error connecting to Passport:", error);
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
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        ImmutableERC721Abi,
        signer
      );

      const tx = await contract.burn(BigNumber.from(tokenId));
      await tx.wait();
      console.log("Burn successful, tx hash:", tx.hash);
      return tx.hash;
    } catch (error: any) {
      console.error("Error burning NFT:", error);
      setError(error.message);
    } finally {
      setIsBurning(false);
    }
  };

  return { burnNFT, isBurning, error };
}
