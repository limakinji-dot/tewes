"use client";

import { useRef, useEffect } from "react";
import { useTrading } from "@/hooks/useTradingContext";
import gsap from "gsap";

export default function QuantumCore({ section }: { section: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { latestTheme } = useTrading();

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    switch (section) {
      case 0: // Hero — besar di tengah
        gsap.to(el, { x: 0, scale: 1, rotation: 0, opacity: 1, duration: 1.2, ease: "power3.out" });
        break;
      case 1: // Live Logic — geser kiri, mengecil
        gsap.to(el, { x: "-22vw", scale: 0.65, rotation: 180, duration: 1, ease: "power3.out" });
        break;
      case 2: // History — fade out tipis
        gsap.to(el, { x: 0, scale: 0.35, opacity: 0.2, rotation: 0, duration: 1, ease: "power3.out" });
        break;
      case 3: // PnL — spin cepat, besar
        gsap.to(el, { x: 0, scale: 1.05, opacity: 1, rotation: 720, duration: 2, ease: "power3.out" });
        break;
    }
  }, [section]);

  const color =
    latestTheme === "profit" ? "#4ade80" : latestTheme === "loss" ? "#f87171" : "#60a5fa";

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
      <div
        ref={ref}
        className="relative w-[260px] h-[260px] sm:w-[360px] sm:h-[360px]"
      >
        {/* Glow aura */}
        <div
          className="absolute inset-[-60px] rounded-full transition-colors duration-1000"
          style={{
            background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
            filter: "blur(50px)",
            opacity: 0.35,
          }}
        />

        {/* Rotating ring 1 */}
        <div className="absolute inset-0 rounded-full border border-white/[0.07] animate-[spin_12s_linear_infinite]" />
        {/* Rotating ring 2 (dashed) */}
        <div className="absolute inset-[-12px] rounded-full border border-dashed border-white/[0.04] animate-[spin_20s_linear_infinite_reverse]" />
        {/* Rotating ring 3 (inner) */}
        <div className="absolute inset-[18px] rounded-full border border-white/[0.05] animate-[spin_15s_linear_infinite]" />

        {/* Main sphere */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/[0.07] to-transparent backdrop-blur-sm border border-white/[0.08] overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]">
          {/* Conic sweep */}
          <div
            className="absolute inset-[-50%] opacity-30"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${color}, transparent, ${color}, transparent)`,
              animation: "spin 10s linear infinite",
            }}
          />
          {/* Inner dark core */}
          <div className="absolute inset-[16%] rounded-full bg-[#030303]/90 border border-white/[0.04] flex items-center justify-center">
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 25px ${color}, 0 0 50px ${color}`,
              }}
            />
          </div>
        </div>

        {/* Floating particles */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/40"
            style={{
              top: `${50 + 38 * Math.sin((deg * Math.PI) / 180)}%`,
              left: `${50 + 38 * Math.cos((deg * Math.PI) / 180)}%`,
              transform: "translate(-50%, -50%)",
              animation: `float ${4 + i * 0.8}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
