"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!titleRef.current) return;
    gsap.fromTo(
      titleRef.current,
      { opacity: 0, y: 100, skewY: 5 },
      {
        opacity: 1,
        y: 0,
        skewY: 0,
        duration: 1.2,
        ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          toggleActions: "play none none reverse",
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center z-10"
    >
      <div className="text-center px-4">
        <motion.div
          initial={{ opacity: 0, letterSpacing: "1em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-[10px] font-mono text-white/30 mb-6 tracking-[0.3em]"
        >
          AI-POWERED QUANTITATIVE SYSTEM
        </motion.div>

        <h1
          ref={titleRef}
          className="text-6xl sm:text-8xl lg:text-9xl font-bold tracking-tighter text-white mb-8"
          style={{ textShadow: "0 0 80px rgba(96,165,250,0.3)" }}
        >
          QUANTUM
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400">
            EXECUTION
          </span>
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="text-sm sm:text-base text-white/40 max-w-md mx-auto font-mono leading-relaxed"
        >
          Autonomous signal generation via multi-timeframe void analysis.
          MEXC perpetual futures. Zero latency execution.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="mt-12 flex items-center justify-center gap-4"
        >
          <div className="glass px-4 py-2 rounded-full text-[10px] font-mono text-white/50">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-neutral inline-block mr-2 animate-pulse" />
            SYSTEM ONLINE
          </div>
        </motion.div>
      </div>
    </section>
  );
}
