"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTrading } from "@/hooks/useTradingContext";
import { formatPrice, formatTime } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function SignalFeed() {
  const { state } = useTrading();
  const [glitchId, setGlitchId] = useState<string | null>(null);

  const openSignals = state.signals.filter((s) => s.status === "OPEN").slice(0, 5);

  useEffect(() => {
    if (openSignals.length > 0) {
      setGlitchId(openSignals[0].id);
      const t = setTimeout(() => setGlitchId(null), 500);
      return () => clearTimeout(t);
    }
  }, [openSignals.length > 0 ? openSignals[0].id : null]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono tracking-[0.2em] text-white/50 uppercase">
          Live Signals
        </h3>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-profit animate-pulse" />
          <span className="text-[10px] font-mono text-white/40">
            {state.active_signal_count}/{state.max_active_signals} ACTIVE
          </span>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {openSignals.map((sig) => (
          <motion.div
            key={sig.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{
              opacity: 1,
              x: 0,
              scale: 1,
              ...(glitchId === sig.id && {
                x: [0, -3, 3, -2, 2, 0],
                transition: { duration: 0.2 },
              }),
            }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "glass rounded-xl p-4 border-l-2 transition-colors",
              sig.decision === "LONG"
                ? "border-l-accent-profit"
                : "border-l-accent-loss"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold font-mono text-white">
                  {sig.symbol.replace("_USDT", "")}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full",
                    sig.decision === "LONG"
                      ? "bg-accent-profit/10 text-accent-profit"
                      : "bg-accent-loss/10 text-accent-loss"
                  )}
                >
                  {sig.decision}
                </span>
              </div>
              <span className="text-[10px] font-mono text-white/30">
                {formatTime(sig.timestamp)}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <div>
                <div className="text-white/30 mb-0.5">ENTRY</div>
                <div className="text-white/80">${formatPrice(sig.entry)}</div>
              </div>
              <div>
                <div className="text-white/30 mb-0.5">TP</div>
                <div className="text-accent-profit">${formatPrice(sig.tp)}</div>
              </div>
              <div>
                <div className="text-white/30 mb-0.5">SL</div>
                <div className="text-accent-loss">${formatPrice(sig.sl)}</div>
              </div>
            </div>

            {sig.entry_hit && (
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-white/40">Live</span>
                <span className="text-xs font-mono text-white/80">
                  ${formatPrice(sig.current_price)}
                </span>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {openSignals.length === 0 && (
        <div className="glass rounded-xl p-8 text-center">
          <div className="text-white/20 text-xs font-mono">NO ACTIVE SIGNALS</div>
          <div className="text-white/10 text-[10px] font-mono mt-1">
            Waiting for AI analysis...
          </div>
        </div>
      )}
    </div>
  );
}

import { cn } from "@/lib/utils";
