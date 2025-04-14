"use client";

import { MainNav } from "@/components/main-nav";
import { MysteryPack } from "@/components/mystery-pack";
import { Inventory } from "@/components/inventory";
import { WalletConnect } from "@/components/wallet-connect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Home() {
  const [shouldRefreshInventory, setShouldRefreshInventory] = useState(0);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const handlePackMinted = () => {
    setShouldRefreshInventory((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen space-bg">
      <div className="container mx-auto px-4">
        <header className="py-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            Alien Hub
          </h1>

          <div className="flex items-center gap-4">
            {walletAddress && (
              <span className="text-sm text-white bg-gray-800 px-3 py-1 rounded-lg">
                {walletAddress}
              </span>
            )}
            <WalletConnect onWalletConnect={setWalletAddress} />
          </div>
        </header>

        <MainNav />

        <Tabs defaultValue="mystery" className="mt-8">
          <TabsList className="grid w-full grid-cols-2 bg-background/50 backdrop-blur-sm">
            <TabsTrigger value="mystery">Mystery Packs</TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              Inventory
            </TabsTrigger>
          </TabsList>
          <TabsContent value="mystery" className="mt-4">
            <MysteryPack onPackMinted={handlePackMinted} />
          </TabsContent>
          <TabsContent value="inventory" className="mt-4">
            <Inventory key={shouldRefreshInventory} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
