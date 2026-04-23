"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import TradeHistoryTable from "@/components/ui/TradeHistoryTable";
import GlassCard from "@/components/ui/GlassCard";

gsap.registerPlugin(ScrollTrigger);

export default function HistorySection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      sectionRef.current,
      { opacity: 0 },
      {
        opacity: 1,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 30%",
          scrub: 1,
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center z-10 px-4 sm:px-8 lg:px-16 py-24 metallic-grid"
    >
      <div className="max-w-5xl mx-auto w-full">
        <div className="mb-12 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
            Trade History
          </h2>
          <p className="text-xs font-mono text-white/30 tracking-widest">
            VERIFIED EXECUTION LOG
          </p>
        </div>

        <GlassCard className="max-w-4xl mx-auto">
          <TradeHistoryTable />
        </GlassCard>
      </div>
    </section>
  );
}
