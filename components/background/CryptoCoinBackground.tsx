"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const COINS = [
  { id: "bitcoin", name: "BTC", url: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { id: "ethereum", name: "ETH", url: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "solana", name: "SOL", url: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "binancecoin", name: "BNB", url: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
  { id: "ripple", name: "XRP", url: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
  { id: "dogecoin", name: "DOGE", url: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
  { id: "cardano", name: "ADA", url: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
  { id: "tron", name: "TRX", url: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png" },
  { id: "chainlink", name: "LINK", url: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png" },
  { id: "polkadot", name: "DOT", url: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png" },
  { id: "litecoin", name: "LTC", url: "https://assets.coingecko.com/coins/images/2/small/litecoin.png" },
  { id: "avalanche", name: "AVAX", url: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
];

interface FloatingCoin {
  id: string;
  name: string;
  url: string;
  x: number;      // 0-100 %
  y: number;      // 0-100 %
  size: number;   // px
  duration: number;
  delay: number;
  opacity: number;
  blur: number;
  driftX: number;
  driftY: number;
}

export default function CryptoCoinBackground() {
  const coins = useMemo<FloatingCoin[]>(() => {
    return Array.from({ length: 28 }).map((_, i) => {
      const coin = COINS[i % COINS.length];
      return {
        ...coin,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 24 + Math.random() * 56, // 24px - 80px
        duration: 12 + Math.random() * 20, // 12-32s
        delay: Math.random() * -30,
        opacity: 0.04 + Math.random() * 0.08, // 0.04 - 0.12
        blur: Math.random() > 0.7 ? 2 : 0,
        driftX: (Math.random() - 0.5) * 120,
        driftY: (Math.random() - 0.5) * 120,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 -z-[5] overflow-hidden pointer-events-none select-none">
      {coins.map((coin, i) => (
        <motion.div
          key={`${coin.id}-${i}`}
          className="absolute"
          style={{
            left: `${coin.x}%`,
            top: `${coin.y}%`,
            width: coin.size,
            height: coin.size,
            opacity: coin.opacity,
            filter: coin.blur ? `blur(${coin.blur}px)` : undefined,
          }}
          animate={{
            y: [0, coin.driftY, 0],
            x: [0, coin.driftX, 0],
            rotate: [0, 360],
            scale: [1, 1.15, 0.9, 1],
          }}
          transition={{
            duration: coin.duration,
            delay: coin.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              backgroundImage: `url(${coin.url})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              boxShadow: `0 0 ${coin.size * 0.8}px ${coin.size * 0.3}px rgba(255,255,255,0.03)`,
            }}
          />
        </motion.div>
      ))}

      {/* Subtle gradient overlays to fade edges */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303] opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-transparent to-[#030303] opacity-40 pointer-events-none" />
    </div>
  );
}
