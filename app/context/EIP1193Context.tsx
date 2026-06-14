"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { BrowserProvider } from "ethers";
import { passportInstance } from "@/lib/immutable-passport-client";

export interface EIP1193ContextState {
  /** ethers v6 provider wrapping the Passport EIP-1193 provider. */
  provider?: BrowserProvider;
  /** Checksummed address of the connected wallet, or "" when disconnected. */
  walletAddress: string;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const noop = async () => {};

export const EIP1193Context = createContext<EIP1193ContextState>({
  provider: undefined,
  walletAddress: "",
  isConnected: false,
  isConnecting: false,
  connect: noop,
  disconnect: noop,
});

export const useWallet = () => useContext(EIP1193Context);

interface EIP1193ContextProviderProps {
  children: React.ReactNode;
}

export const EIP1193ContextProvider = ({
  children,
}: EIP1193ContextProviderProps) => {
  const [provider, setProvider] = useState<BrowserProvider | undefined>();
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  const applyAccounts = useCallback(
    (eip1193: any, accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        setProvider(new BrowserProvider(eip1193));
        setWalletAddress(accounts[0]);
      }
    },
    []
  );

  // Silent auto-connect: if the user already has an active Passport session,
  // restore it without prompting.
  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      if (!passportInstance) return;
      try {
        const eip1193 = await passportInstance.connectEvm();
        const accounts: string[] = await eip1193.request({
          method: "eth_accounts",
        });
        if (!cancelled) applyAccounts(eip1193, accounts);
      } catch (error) {
        console.error("Passport auto-connect failed:", error);
      }
    };
    restore();
    return () => {
      cancelled = true;
    };
  }, [applyAccounts]);

  const connect = useCallback(async () => {
    if (!passportInstance) return;
    setIsConnecting(true);
    try {
      const eip1193 = await passportInstance.connectEvm();
      const accounts: string[] = await eip1193.request({
        method: "eth_requestAccounts",
      });
      applyAccounts(eip1193, accounts);
    } catch (error) {
      console.error("Passport connect failed:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [applyAccounts]);

  const disconnect = useCallback(async () => {
    try {
      await passportInstance.logout();
    } catch (error) {
      console.error("Passport logout failed:", error);
    } finally {
      setProvider(undefined);
      setWalletAddress("");
    }
  }, []);

  return (
    <EIP1193Context.Provider
      value={{
        provider,
        walletAddress,
        isConnected: Boolean(walletAddress),
        isConnecting,
        connect,
        disconnect,
      }}
    >
      {children}
    </EIP1193Context.Provider>
  );
};
