"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Attribute {
  trait_type: string;
  value: string;
}

interface NFT {
  token_id: string;
  name: string;
  image: string;
  description: string;
  collection: string;
  contractAddress: string;
  attributes?: Attribute[];
}

interface NFTInfoDialogProps {
  nft: NFT | null;
  onClose: () => void;
}

export function NFTInfoDialog({ nft, onClose }: NFTInfoDialogProps) {
  if (!nft) return null;

  return (
    <Dialog open={!!nft} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 overflow-y-auto max-h-[400px] pr-4">
            <DialogTitle>{nft.name}</DialogTitle>
            <p className="text-sm text-muted-foreground mb-2">
              {nft.description}
            </p>
            <Label className="font-semibold">Token ID:</Label>
            <p className="mb-2">{nft.token_id}</p>
            <Label className="font-semibold">Collection:</Label>
            <p className="mb-2">{nft.collection}</p>
            <Label className="font-semibold">Contract Address:</Label>
            <p className="mb-2 break-all">{nft.contractAddress}</p>
            {nft.attributes && (
              <div className="mt-4">
                <Label className="font-semibold mb-2 block">Attributes</Label>
                <table className="w-full text-sm border border-muted rounded overflow-hidden">
                  <thead>
                    <tr className="bg-muted">
                      <th className="text-left px-2 py-1">Trait</th>
                      <th className="text-left px-2 py-1">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {nft.attributes.map((attr, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1">{attr.trait_type}</td>
                        <td className="px-2 py-1">{String(attr.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="flex-1 flex items-center justify-center">
            <img
              src={nft.image || "/placeholder.svg"}
              alt={nft.name}
              className="w-full h-auto rounded max-h-[400px] object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
