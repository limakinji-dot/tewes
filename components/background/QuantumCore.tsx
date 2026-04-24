"use client";

import { useRef, useEffect, useMemo, useCallback, useState } from "react";
import { useTrading } from "@/hooks/useTradingContext";
import gsap from "gsap";
import OrbCore from "@/components/background/OrbCore";

const COINS = [
  { id: "bitcoin", name: "BTC", path: "/images/coins/bitcoin.png" },
  { id: "ethereum", name: "ETH", path: "/images/coins/ethereum.png" },
  { id: "solana", name: "SOL", path: "/images/coins/solana.png" },
  { id: "binancecoin", name: "BNB", path: "/images/coins/bnb.png" },
];

interface OrbitingCoin {
  id: string; name: string; path: string;
  radius: number; speed: number; startAngle: number;
  size: number; ringIndex: number; yOffset: number;
}

export default function QuantumCore({ section }: { section: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const ring3Ref = useRef<HTMLDivElement>(null);
  const coinsRef = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const isVisibleRef = useRef(true);
  const { latestTheme } = useTrading();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const color = useMemo(() => {
    return latestTheme === "profit" ? "#4ade80" : latestTheme === "loss" ? "#f87171" : "#60a5fa";
  }, [latestTheme]);

  const colorDim = useMemo(() => {
    return latestTheme === "profit" ? "rgba(74,222,128,0.12)" : latestTheme === "loss" ? "rgba(248,113,113,0.12)" : "rgba(96,165,250,0.12)";
  }, [latestTheme]);

  const orbitingCoins = useMemo<OrbitingCoin[]>(() => {
    const count = isMobile ? 3 : 6;
    return Array.from({ length: count }).map((_, i) => {
      const coin = COINS[i % COINS.length];
      const ringIndex = i % 3;
      const baseRadius = isMobile
        ? (ringIndex === 0 ? 130 : ringIndex === 1 ? 95 : 65)
        : (ringIndex === 0 ? 200 : ringIndex === 1 ? 150 : 100);
      return {
        ...coin,
        radius: baseRadius,
        speed: 0.00015 + i * 0.00008,
        startAngle: (i / count) * Math.PI * 2,
        size: isMobile ? 22 : 30,
        ringIndex,
        yOffset: (Math.random() - 0.5) * (isMobile ? 30 : 40),
      };
    });
  }, [isMobile]);

  const particles = useMemo(() => {
    const count = isMobile ? 4 : 8;
    return Array.from({ length: count }).map((_, i) => ({
      angle: (i / count) * Math.PI * 2,
      radius: isMobile ? 35 + Math.random() * 25 : 55 + Math.random() * 45,
      speed: 0.0008 + Math.random() * 0.0015,
      size: isMobile ? 2 : 2.5,
      yOffset: (Math.random() - 0.5) * 20,
    }));
  }, [isMobile]);

  // GSAP section transitions — hanya wrapper & core
  useEffect(() => {
    if (!wrapperRef.current) return;
    const tl = gsap.timeline({ defaults: { duration: 1, ease: "power2.out" } });
    const coinEls = coinsRef.current.filter(Boolean) as HTMLDivElement[];

    switch (section) {
      case 0:
        tl.to(wrapperRef.current, { x: 0, scale: 1 }, 0)
          .to(coreRef.current, { scale: 1, opacity: 1 }, 0)
          .to(coinEls, { scale: 1, opacity: 0.8, duration: 1, stagger: 0.02 }, 0);
        break;
      case 1:
        tl.to(wrapperRef.current, { x: isMobile ? "-12vw" : "-10vw", scale: 0.9 }, 0)
          .to(coreRef.current, { scale: 0.75, opacity: 0.9 }, 0)
          .to(coinEls, { scale: 0.7, opacity: 0.5, duration: 1, stagger: 0.02 }, 0);
        break;
      case 2:
        tl.to(wrapperRef.current, { x: 0, scale: 0.8 }, 0)
          .to(coreRef.current, { scale: 0.55, opacity: 0.6 }, 0)
          .to(coinEls, { scale: 0.4, opacity: 0.2, duration: 1, stagger: 0.02 }, 0);
        break;
      case 3:
        tl.to(wrapperRef.current, { x: 0, scale: isMobile ? 1.05 : 1.1 }, 0)
          .to(coreRef.current, { scale: isMobile ? 1.1 : 1.2, opacity: 1 }, 0)
          .to(coinEls, { scale: isMobile ? 1.05 : 1.15, opacity: 1, duration: 1, stagger: 0.02 }, 0);
        break;
    }
  }, [section, isMobile]);

  // Lightweight RAF — throttle 30fps, skip kalau hidden
  const animate = useCallback(() => {
    if (!isVisibleRef.current) { rafRef.current = requestAnimationFrame(animate); return; }

    const now = performance.now();
    if (now - lastTimeRef.current < 33) { rafRef.current = requestAnimationFrame(animate); return; }
    lastTimeRef.current = now;

    const cx = 200, cy = 200;

    orbitingCoins.forEach((coin, i) => {
      const el = coinsRef.current[i];
      if (!el) return;
      const t = now * coin.speed + coin.startAngle;
      const x = Math.cos(t) * coin.radius;
      const z = Math.sin(t) * coin.radius;
      const y = coin.yOffset + Math.sin(t * 0.5) * 12;
      const scale = 0.6 + ((z + coin.radius) / (coin.radius * 2)) * 0.8;
      const opacity = 0.35 + ((z + coin.radius) / (coin.radius * 2)) * 0.65;
      el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      el.style.opacity = String(opacity);
      el.style.zIndex = z > 0 ? "10" : "1";
    });

    particles.forEach((p, i) => {
      const el = particlesRef.current[i];
      if (!el) return;
      const t = now * p.speed + p.angle;
      const x = Math.cos(t) * p.radius;
      const y = Math.sin(t) * p.radius * 0.6 + p.yOffset;
      el.style.transform = `translate(${x}px, ${y}px)`;
    });

    rafRef.current = requestAnimationFrame(animate);
  }, [orbitingCoins, particles]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  // Pause when offscreen
  useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { isVisibleRef.current = e.isIntersecting; },
      { threshold: 0 }
    );
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  const ringSize = isMobile ? [240, 180, 120] : [320, 240, 160];

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none" style={{ perspective: "800px" }}>
      <div
        ref={wrapperRef}
        className="relative"
        style={{
          width: isMobile ? 300 : 400,
          height: isMobile ? 300 : 400,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Coins */}
        <div className="absolute inset-0 flex items-center justify-center">
          {orbitingCoins.map((coin, i) => (
            <div
              key={`c-${i}`}
              ref={el => { coinsRef.current[i] = el; }}
              className="absolute"
              style={{
                width: coin.size,
                height: coin.size,
                willChange: "transform, opacity",
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.08)]">
                <img
                  src={coin.path}
                  alt={coin.name}
                  className="w-full h-full object-contain rounded-full"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Rings */}
        {[ring3Ref, ring2Ref, ring1Ref].map((ref, i) => (
          <div key={`ring-${i}`} ref={ref} className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute rounded-full border transition-colors duration-700"
              style={{
                width: ringSize[i],
                height: ringSize[i],
                borderColor: i === 0 ? colorDim : color,
                borderWidth: i === 1 ? "2px" : "1px",
                opacity: i === 0 ? 0.4 : i === 1 ? 0.25 : 0.35,
              }}
            />
          </div>
        ))}

        {/* Core */}
        <div ref={coreRef} className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 10 }}>
          <OrbCore color={color} section={section} size={isMobile ? 130 : 170} />
        </div>

        {/* Particles */}
        {particles.map((p, i) => (
          <div
            key={`p-${i}`}
            ref={el => { particlesRef.current[i] = el; }}
            className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
            style={{
              backgroundColor: i % 3 === 0 ? color : "rgba(255,255,255,0.35)",
              marginLeft: -p.size / 2,
              marginTop: -p.size / 2,
              width: p.size,
              height: p.size,
              willChange: "transform",
            }}
          />
        ))}
      </div>
    </div>
  );
}
