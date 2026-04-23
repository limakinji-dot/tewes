import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "katex/dist/katex.min.css";
import "./globals.css";
import { TradingProvider } from "@/hooks/useTradingContext";

export const metadata: Metadata = {
  title: "Agent-X | Quantum Execution",
  description: "Premium AI Auto Signal Trading Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <TradingProvider>{children}</TradingProvider>
      </body>
    </html>
  );
}
