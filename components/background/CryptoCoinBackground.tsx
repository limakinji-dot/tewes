// CryptoCoinBackground.tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const COINS = [
  { id: "bitcoin", name: "BTC", path: "/images/coins/bitcoin.png" },
  { id: "ethereum", name: "ETH", path: "/images/coins/ethereum.png" },
  { id: "solana", name: "SOL", path: "/images/coins/solana.png" },
  { id: "binancecoin", name: "BNB", path: "/images/coins/bnb.png" },
  { id: "ripple", name: "XRP", path: "/images/coins/xrp.png" },
  { id: "dogecoin", name: "DOGE", path: "/images/coins/dogecoin.png" },
  { id: "cardano", name: "ADA", path: "/images/coins/cardano.png" },
  { id: "tron", name: "TRX", path: "/images/coins/tron.png" },
  { id: "chainlink", name: "LINK", path: "/images/coins/chainlink.png" },
  { id: "polkadot", name: "DOT", path: "/images/coins/polkadot.png" },
  { id: "litecoin", name: "LTC", path: "/images/coins/litecoin.png" },
  { id: "avalanche", name: "AVAX", path: "/images/coins/avalanche.png" },
];

interface FloatingCoin {
  id: string;
  name: string;
  path: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
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
        size: 32 + Math.random() * 64,
        duration: 14 + Math.random() * 18,
        delay: Math.random() * -20,
        opacity: 0.3 + Math.random() * 0.4, // 30% - 70%
        driftX: (Math.random() - 0.5) * 100,
        driftY: (Math.random() - 0.5) * 100,
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 z-[1] overflow-hidden pointer-events-none select-none">
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
            willChange: "transform",
          }}
          animate={{
            y: [0, coin.driftY, 0],
            x: [0, coin.driftX, 0],
            rotate: [0, 360],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{
            duration: coin.duration,
            delay: coin.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <img
            src={coin.path}
            alt={coin.name}
            className="w-full h-full object-contain"
            style={{
              filter: `drop-shadow(0 0 ${coin.size * 0.6}px rgba(255,255,255,0.3))`,
            }}
            draggable={false}
          />
        </motion.div>
      ))}
    </div>
  );
}
