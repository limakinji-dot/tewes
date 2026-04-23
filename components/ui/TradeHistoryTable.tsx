"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import type { Signal } from "@/lib/types";

export default function TradeHistoryTable() {
  const [history, setHistory] = useState<Signal[]>([]);

  useEffect(() => {
    fetch("/api/history/signals?limit=20")
      .then((r) => r.json())
      .then((data) => setHistory(data.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      {/* Fade overlays */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#030303] to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#030303] to-transparent z-10 pointer-events-none" />

      <div className="overflow-hidden rounded-2xl glass">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-white/30 font-normal">
                PAIR
              </th>
              <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-white/30 font-normal">
                DIR
              </th>
              <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-white/30 font-normal">
                ENTRY
              </th>
              <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-white/30 font-normal">
                CLOSE
              </th>
              <th className="px-6 py-4 text-[10px] font-mono tracking-widest text-white/30 font-normal text-right">
                PnL %
              </th>
            </tr>
          </thead>
          <tbody>
            {history.map((sig, i) => (
              <motion.tr
                key={sig.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-6 py-4 text-xs font-mono text-white/80">
                  {sig.symbol.replace("_USDT", "")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded",
                      sig.decision === "LONG"
                        ? "bg-accent-profit/10 text-accent-profit"
                        : "bg-accent-loss/10 text-accent-loss"
                    )}
                  >
                    {sig.decision}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-mono text-white/50">
                  ${formatPrice(sig.entry)}
                </td>
                <td className="px-6 py-4 text-xs font-mono text-white/50">
                  ${formatPrice(sig.closed_price)}
                </td>
                <td
                  className={cn(
                    "px-6 py-4 text-xs font-mono text-right font-bold",
                    (sig.pnl_pct || 0) >= 0 ? "text-accent-profit" : "text-accent-loss"
                  )}
                >
                  {(sig.pnl_pct || 0) >= 0 ? "+" : ""}
                  {sig.pnl_pct?.toFixed(2)}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
