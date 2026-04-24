"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import AuroraBackground from "@/components/background/AuroraBackground";
import QuantumCore from "@/components/background/QuantumCore";
import LaTeXOverlay from "@/components/ui/LaTeXOverlay";
import Preloader from "@/components/ui/Preloader";
import HeroSection from "@/sections/HeroSection";
import LiveLogicSection from "@/sections/LiveLogicSection";
import HistorySection from "@/sections/HistorySection";
import PnLShowcaseSection from "@/sections/PnLShowcaseSection";

gsap.registerPlugin(ScrollTrigger);

const PRELOADER_KEY = "agent-x-loaded";

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [section, setSection] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showPreloader, setShowPreloader] = useState(false);

  // Cek sessionStorage saat mount — skip preloader kalau sudah pernah load
  useEffect(() => {
    const alreadyLoaded = typeof window !== "undefined" && sessionStorage.getItem(PRELOADER_KEY);
    if (alreadyLoaded) {
      setLoaded(true);
      setShowPreloader(false);
    } else {
      setShowPreloader(true);
    }
  }, []);

  const handlePreloaderComplete = useCallback(() => {
    setLoaded(true);
    setShowPreloader(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(PRELOADER_KEY, "true");
    }
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
      {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}

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

       
