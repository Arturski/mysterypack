"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Use Next.js router
import { passportInstance } from "../utils/setupDefault"; //

export default function PassportRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function handleRedirect() {
      try {
        await passportInstance.loginCallback();
        router.push("/"); // Redirect to homepage after successful login
      } catch (error) {
        console.error("Passport redirect error:", error);
        router.push("/login"); // Redirect to login if there's an error
      }
    }

    handleRedirect();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      Loading...
    </div>
  );
}
