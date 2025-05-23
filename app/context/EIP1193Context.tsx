"use client";

import { createContext, useEffect, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";

export interface EIP1193ContextState {
  provider?: Web3Provider;
  setProvider: (provider: Web3Provider | undefined) => void;
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  isPassportProvider: boolean;
}

export const EIP1193Context = createContext<EIP1193ContextState>({
  provider: undefined,
  setProvider: () => {},
  walletAddress: "",
  setWalletAddress: () => {},
  isPassportProvider: false,
});

interface EIP1193ContextProviderProps {
  children: React.ReactNode;
}

export const EIP1193ContextProvider = ({
  children,
}: EIP1193ContextProviderProps) => {
  const [provider, setProvider] = useState<Web3Provider | undefined>();
  const [walletAddress, setWalletAddress] = useState("");
  const [isPassport, setIsPassport] = useState(false);

  useEffect(() => {
    if (!provider) {
      setWalletAddress("");
      setIsPassport(false);
      return;
    }

    const setProviderDetails = async () => {
      const address = await provider.getSigner().getAddress();
      setWalletAddress(address);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setIsPassport((provider.provider as any)?.isPassport === true);
    };

    setProviderDetails();
  }, [provider]);

  return (
    <EIP1193Context.Provider
      value={{
        provider,
        setProvider,
        walletAddress,
        setWalletAddress,
        isPassportProvider: isPassport,
      }}
    >
      {children}
    </EIP1193Context.Provider>
  );
};
