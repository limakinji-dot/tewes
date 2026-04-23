"use client";

import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useTrading } from "@/hooks/useTradingContext";
import PnLPoster from "@/components/ui/PnLPoster";
import GlassCard from "@/components/ui/GlassCard";

gsap.registerPlugin(ScrollTrigger);

export default function PnLShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { state } = useTrading();
  const [selectedSignal, setSelectedSignal] = useState(state.signals.find((s) => s.result));

  useEffect(() => {
    const closed = state.signals.find((s) => s.result && s.pnl_pct != null);
    if (closed) setSelectedSignal(closed);
  }, [state.signals]);

  useGSAP(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: sectionRef });

  const latestPnl = state.total_pnl_pct;
  const isProfit = latestPnl >= 0;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center z-10 px-4 py-24"
    >
      <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2
              className="text-5xl sm:text-7xl font-bold tracking-tighter mb-4"
              style={{
                color: isProfit ? "#4ade80" : "#f87171",
                textShadow: `0 0 60px ${isProfit ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
              }}
            >
              {isProfit ? "+" : ""}
              {latestPnl.toFixed(2)}%
            </h2>
            <p className="text-xs font-mono text-white/30 tracking-widest">
              TOTAL PORTFOLIO RETURN
            </p>
          </motion.div>

          <GlassCard className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white mb-1">{state.winrate}%</div>
                <div className="text-[10px] font-mono text-white/30">WIN RATE</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-1">{state.trade_count}</div>
                <div className="text-[10px] font-mono text-white/30">TOTAL TRADES</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-profit mb-1">{state.win_count}</div>
                <div className="text-[10px] font-mono text-white/30">WINS</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent-loss mb-1">{state.loss_count}</div>
                <div className="text-[10px] font-mono text-white/30">LOSSES</div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="flex justify-center">
          <AnimatePresence mode="wait">
            {selectedSignal && (
              <motion.div
                key={selectedSignal.id}
                initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.9, rotateY: 15 }}
                transition={{ type: "spring", damping: 20 }}
                style={{ perspective: 1000 }}
              >
                <PnLPoster signal={selectedSignal} leverage={10} entryUsdt={100} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
