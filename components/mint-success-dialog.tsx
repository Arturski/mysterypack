"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SPECIALS_CONTRACT_ADDRESS } from "@/lib/constants";

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
          <DialogTitle className="flex items-center gap-2 font-heading tracking-wide">
            <CheckCircle2 className="h-5 w-5 text-accent" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Continue
          </Button>
          <Button
            className="w-full"
            onClick={() =>
              window.open(
                `https://play.sandbox.immutable.com/collection/zkEvm/${SPECIALS_CONTRACT_ADDRESS}/`,
                "_blank"
              )
            }
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Immutable Play
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
