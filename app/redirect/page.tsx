"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { passportInstance } from "@/lib/immutable-passport-client";

export default function PassportRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      try {
        await passportInstance.loginCallback();
      } catch (error) {
        console.error("Passport redirect error:", error);
      } finally {
        router.replace("/");
      }
    }
    handleRedirect();
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 space-bg text-foreground">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="font-heading tracking-wide">Completing sign-in…</p>
    </div>
  );
}
