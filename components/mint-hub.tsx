// MysteryHub.tsx
import { MintPack } from "@/components/mint-pack";
import { MintVipPass } from "@/components/mint-vip-pass";

export function MintHub() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MintPack />
      <MintVipPass />
    </div>
  );
}
