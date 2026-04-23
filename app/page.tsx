"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import Scene from "@/components/three/Scene";
import LaTeXOverlay from "@/components/ui/LaTeXOverlay";
import HeroSection from "@/sections/HeroSection";
import LiveLogicSection from "@/sections/LiveLogicSection";
import HistorySection from "@/sections/HistorySection";
import PnLShowcaseSection from "@/sections/PnLShowcaseSection";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  useGSAP(() => {
    if (!containerRef.current) return;

    const sections = gsap.utils.toArray<HTMLElement>(".story-section");
    
    sections.forEach((sec, i) => {
      ScrollTrigger.create({
        trigger: sec,
        start: "top center",
        end: "bottom center",
        onEnter: () => setSection(i),
        onEnterBack: () => setSection(i),
      });
    });

    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setScrollProgress(self.progress),
    });
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="relative bg-citadel-bg">
      {/* Fixed 3D Background */}
      <Scene scrollProgress={scrollProgress} section={section} />
      
      {/* LaTeX Overlays */}
      <LaTeXOverlay />

      {/* Scrollable Content */}
      <div className="relative z-10">
        <div className="story-section">
          <HeroSection />
        </div>
        <div className="story-section">
          <LiveLogicSection />
        </div>
        <div className="story-section">
          <HistorySection />
        </div>
        <div className="story-section">
          <PnLShowcaseSection />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-8 rounded-full transition-all duration-500 ${
              section === i ? "bg-white/60 h-12" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </main>
  );
}
