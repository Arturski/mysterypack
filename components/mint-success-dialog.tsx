"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MintSuccessDialogProps {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  title: string;
  description: string;
}

export function MintSuccessDialog({
  open,
  onOpenChange,
  title,
  description,
}: MintSuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎉 {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Continue Minting
          </Button>
          <Button
            className="w-full"
            onClick={() => {
              window.open(
                `https://play.sandbox.immutable.com/collection/zkEvm/${process.env.NEXT_PUBLIC_SPECIALS_CONTRACT_ADDRESS}/`,
                "_blank"
              );
            }}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View in Immutable
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
