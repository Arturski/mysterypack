import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout"; // 👈 wrap content in client layout

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Alien Crypto Hub",
  description: "Web3 platform for alien NFTs and crypto gaming",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.className} bg-[#050B17]`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
