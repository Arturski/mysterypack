"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Boxes, Sparkles } from "lucide-react";
import { WalletConnect } from "@/components/wallet-connect";
import { MintHub } from "@/components/mint-hub";
import Inventory from "@/components/inventory";

export default function Home() {
  return (
    <div className="relative min-h-dvh space-bg">
      <div className="scanlines pointer-events-none absolute inset-0 z-0" />

      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary neon-text" />
            <span className="font-heading text-xl font-bold tracking-wider text-foreground neon-text sm:text-2xl">
              ALIEN HUB
            </span>
          </div>
          <WalletConnect />
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-4 py-8">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Open the Unknown
          </h1>
          <p className="mt-3 text-muted-foreground">
            Mint Mystery Packs on Immutable zkEVM, then crack them open to reveal
            collectible Aliens — from Common to Mythical.
          </p>
        </div>

        <Tabs defaultValue="mint" className="mx-auto max-w-5xl">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="mint" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Mint
            </TabsTrigger>
            <TabsTrigger value="inventory" className="gap-2">
              <Boxes className="h-4 w-4" />
              Inventory
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mint" className="mt-8">
            <MintHub />
          </TabsContent>
          <TabsContent value="inventory" className="mt-8">
            <Inventory />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
