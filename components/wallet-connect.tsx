"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet } from "lucide-react";
import { passportInstance } from "../app/utils/setupDefault";

interface WalletConnectProps {
  onWalletConnect: (walletAddress: string | null) => void;
}

export function WalletConnect({ onWalletConnect }: WalletConnectProps) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);

  // Auto-connect Passport wallet
  useEffect(() => {
    const connectPassport = async () => {
      if (!passportInstance) return;
      try {
        const provider = await passportInstance.connectEvm();
        const accounts = await provider.request({ method: "eth_accounts" });

        if (accounts && accounts.length > 0) {
          setIsLoggedIn(true);
          setAccountAddress(accounts[0]);
          onWalletConnect(accounts[0]); // Send address to parent component
        }
      } catch (error) {
        console.error("Error fetching Passport accounts:", error);
      }
    };

    connectPassport();
  }, [onWalletConnect]);

  // Handle wallet connection
  const loginWithPassport = async () => {
    if (!passportInstance) return;
    try {
      const provider = await passportInstance.connectEvm();
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setIsLoggedIn(true);
        setAccountAddress(accounts[0]);
        onWalletConnect(accounts[0]); // Send address to parent component
      }
    } catch (error) {
      console.error("Error connecting to Passport:", error);
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      await passportInstance.logout();
      setIsLoggedIn(false);
      setAccountAddress(null);
      onWalletConnect(null); // Send null to parent component on logout
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="relative">
      {isLoggedIn ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-primary hover:border-primary/80"
            >
              <Wallet className="mr-2 h-4 w-4" />
              {accountAddress
                ? `${accountAddress.slice(0, 6)}...${accountAddress.slice(-4)}`
                : "Connected"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={6}
            className="bg-gray-800 text-white w-48 rounded-md shadow-lg p-2"
          >
            <DropdownMenuItem className="hover:bg-gray-700 rounded-md px-4 py-2">
              {accountAddress
                ? `Wallet: ${accountAddress.slice(
                    0,
                    6
                  )}...${accountAddress.slice(-4)}`
                : "N/A"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={logout}
              className="hover:bg-red-500 rounded-md px-4 py-2 cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="outline"
          className="border-primary hover:border-primary/80"
          onClick={loginWithPassport}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
