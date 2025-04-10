"use client";

import { EIP1193ContextProvider } from "./context/EIP1193Context";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <EIP1193ContextProvider>{children}</EIP1193ContextProvider>;
}
