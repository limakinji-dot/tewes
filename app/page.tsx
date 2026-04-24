"use client";

import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AuroraBackground from "@/components/background/AuroraBackground";
import QuantumCore from "@/components/background/QuantumCore";
import LaTeXOverlay from "@/components/ui/LaTeXOverlay";
import CustomCursor from "@/components/ui/CustomCursor";
import Preloader from "@/components/ui/Preloader";
import HeroSection from "@/sections/HeroSection";
import LiveLogicSection from "@/sections/LiveLogicSection";
import HistorySection from "@/sections/HistorySection";
import PnLShowcaseSection from "@/sections/PnLShowcaseSection";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const handlePreloaderComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  useGSAP(() => {
    if (!containerRef.current || !loaded) return;
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
  }, { scope: containerRef, dependencies: [loaded] });

  return (
    <>
      {!loaded && <Preloader onComplete={handlePreloaderComplete} />}

      <main ref={containerRef} className="relative bg-[#030303]">
        <AuroraBackground />
        <QuantumCore section={section} />
        <LaTeXOverlay />

        <div className="relative z-10">
          <div className="story-section"><HeroSection /></div>
          <div className="story-section"><LiveLogicSection /></div>
          <div className="story-section"><HistorySection /></div>
          <div className="story-section"><PnLShowcaseSection /></div>
        </div>

        {/* Section indicator */}
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-700"
              style={{
                width: section === i ? "2px" : "1.5px",
                height: section === i ? "40px" : "24px",
                background: section === i
                  ? "rgba(212,168,71,0.7)"
                  : "rgba(255,255,255,0.12)",
              }}
            />
          ))}
        </div>
      </main>
    </>
  );
}
