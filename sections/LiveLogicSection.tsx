"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SignalFeed from "@/components/ui/SignalFeed";
import GlassCard from "@/components/ui/GlassCard";

gsap.registerPlugin(ScrollTrigger);

export default function LiveLogicSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!contentRef.current) return;

    // On mobile skip x-slide animation (too small for the effect)
    const isMobile = window.innerWidth < 768;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, x: isMobile ? 0 : 80, y: isMobile ? 20 : 0 },
      {
        opacity: 1,
        x: 0,
        y: 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top center",
          end: "center center",
          scrub: 1,
        },
      }
    );
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center lg:justify-end z-10 px-4 sm:px-8 lg:px-16 py-20"
    >
      <div ref={contentRef} className="w-full max-w-lg lg:ml-auto">
        <GlassCard>
          <div className="mb-6">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-2">
              Live Logic
            </h2>
            <p className="text-xs font-mono text-white/30 leading-relaxed">
              Real-time AI analysis stream from Qwen multi-agent system
            </p>
          </div>
          <SignalFeed />
        </GlassCard>
      </div>
    </section>
  );
}
