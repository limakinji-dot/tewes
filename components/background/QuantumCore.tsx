"use client";

import { useRef, useEffect, useMemo } from "react";
import { useTrading } from "@/hooks/useTradingContext";
import gsap from "gsap";

interface Particle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  ring: number;
  yOffset: number;
}

export default function QuantumCore({ section }: { section: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const ring1Ref = useRef<HTMLDivElement>(null);
  const ring2Ref = useRef<HTMLDivElement>(null);
  const ring3Ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const { state, latestTheme } = useTrading();

  const color = useMemo(() => {
    return latestTheme === "profit" ? "#4ade80" : latestTheme === "loss" ? "#f87171" : "#60a5fa";
  }, [latestTheme]);

  const colorDim = useMemo(() => {
    return latestTheme === "profit" ? "rgba(74,222,128,0.2)" : latestTheme === "loss" ? "rgba(248,113,113,0.2)" : "rgba(96,165,250,0.2)";
  }, [latestTheme]);

  const particles = useMemo<Particle[]>(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < 24; i++) {
      arr.push({
        angle: (i / 24) * Math.PI * 2,
        radius: 70 + Math.random() * 60,
        speed: 0.002 + Math.random() * 0.004,
        size: 1.5 + Math.random() * 2.5,
        ring: i % 3,
        yOffset: (Math.random() - 0.5) * 40,
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    if (!wrapperRef.current || !coreRef.current) return;

    const tl = gsap.timeline({ defaults: { duration: 1.2, ease: "power3.inOut" } });

    switch (section) {
      case 0:
        tl.to(wrapperRef.current, { x: 0, scale: 1, rotateY: 0, rotateX: 0 }, 0)
          .to(coreRef.current, { scale: 1, opacity: 1 }, 0)
          .to(ring1Ref.current, { rotateX: 75, rotateZ: 0, scale: 1 }, 0)
          .to(ring2Ref.current, { rotateX: 45, rotateZ: 30, scale: 1 }, 0)
          .to(ring3Ref.current, { rotateX: 0, rotateZ: -20, scale: 1 }, 0);
        break;
      case 1:
        tl.to(wrapperRef.current, { x: "-20vw", scale: 0.9, rotateY: 15 }, 0)
          .to(coreRef.current, { scale: 0.7, opacity: 0.9 }, 0)
          .to(ring1Ref.current, { rotateX: 90, rotateZ: 45, scale: 1.3, y: -40 }, 0)
          .to(ring2Ref.current, { rotateX: 0, rotateZ: 90, scale: 1.1, y: 0 }, 0)
          .to(ring3Ref.current, { rotateX: 60, rotateZ: -60, scale: 0.9, y: 40 }, 0);
        break;
      case 2:
        tl.to(wrapperRef.current, { x: 0, scale: 0.85, rotateY: 0 }, 0)
          .to(coreRef.current, { scale: 0.5, opacity: 0.6 }, 0)
          .to(ring1Ref.current, { rotateX: 0, rotateZ: 0, scale: 1.5, opacity: 0.3 }, 0)
          .to(ring2Ref.current, { rotateX: 0, rotateZ: 30, scale: 1.2, opacity: 0.5 }, 0)
          .to(ring3Ref.current, { rotateX: 0, rotateZ: -15, scale: 1, opacity: 0.7 }, 0);
        break;
      case 3:
        tl.to(wrapperRef.current, { x: 0, scale: 1.15, rotateY: 0 }, 0)
          .to(coreRef.current, { scale: 1.3, opacity: 1 }, 0)
          .to(ring1Ref.current, { rotateX: 80, rotateZ: 180, scale: 1.2 }, 0)
          .to(ring2Ref.current, { rotateX: 50, rotateZ: -180, scale: 1.1 }, 0)
          .to(ring3Ref.current, { rotateX: 20, rotateZ: 360, scale: 1 }, 0);
        break;
    }
  }, [section]);

  useEffect(() => {
    let raf: number;
    const svg = svgRef.current;
    if (!svg) return;

    const animate = (time: number) => {
      const w = 400;
      const h = 400;
      const cx = w / 2;
      const cy = h / 2;

      const positions = particles.map((p, i) => {
        const t = time * p.speed + p.angle;
        let r = p.radius;

        if (section === 1) r += Math.sin(t * 3) * 20;
        if (section === 2) r = 60 + (i % 5) * 25;
        if (section === 3) r += Math.sin(time * 0.005 + i) * 30;

        const x = cx + Math.cos(t) * r;
        const y = cy + Math.sin(t) * r * 0.6 + p.yOffset;

        const el = particlesRef.current[i];
        if (el) {
          el.style.transform = `translate(${x - cx}px, ${y - cy}px)`;
          el.style.opacity = section === 2 && i > 12 ? "0.2" : "0.8";
        }

        return { x, y, size: p.size };
      });

      let pathData = "";
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const dx = positions[i].x - positions[j].x;
          const dy = positions[i].y - positions[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const threshold = section === 3 ? 120 : section === 1 ? 80 : 60;
          if (dist < threshold) {
            pathData += `M${positions[i].x},${positions[i].y} L${positions[j].x},${positions[j].y} `;
          }
        }
      }

      const pathEl = svg.querySelector("path");
      if (pathEl) {
        pathEl.setAttribute("d", pathData);
        pathEl.setAttribute("stroke", colorDim);
        pathEl.setAttribute("stroke-width", section === 3 ? "1.5" : "0.8");
      }

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(af);
  }, [particles, section, colorDim]);

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none perspective-[1000px]">
      <div
        ref={wrapperRef}
        className="relative w-[400px] h-[400px] transition-none"
        style={{ transformStyle: "preserve-3d", willChange: "transform", backfaceVisibility: "hidden" }}
      >
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 400 400"
          style={{ zIndex: 5 }}
        >
          <path
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={section === 0 ? 0.3 : section === 1 ? 0.5 : section === 2 ? 0.2 : 0.6}
          />
        </svg>

        <div
          ref={ring3Ref}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute rounded-full border transition-colors duration-700"
            style={{
              width: "320px",
              height: "320px",
              borderColor: colorDim,
              borderWidth: "1px",
              borderStyle: section === 2 ? "dashed" : "solid",
              boxShadow: `0 0 40px ${colorDim}`,
            }}
          />
          {[0, 120, 240].map((deg, i) => (
            <div
              key={`r3-${i}`}
              className="absolute w-2 h-2 rounded-full transition-colors duration-700"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 12px ${color}`,
                top: "50%",
                left: "50%",
                marginLeft: "-4px",
                marginTop: "-4px",
                transform: `rotate(${deg}deg) translateX(160px)`,
                animation: `orbitRing3 ${10 + i * 2}s linear infinite`,
              }}
            />
          ))}
        </div>

        <div
          ref={ring2Ref}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute rounded-full border transition-colors duration-700"
            style={{
              width: "240px",
              height: "240px",
              borderColor: color,
              borderWidth: "2px",
              opacity: 0.4,
              boxShadow: `inset 0 0 30px ${colorDim}`,
            }}
          />
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <div
                key={`r2-${i}`}
                className="absolute flex flex-col items-center gap-1 transition-opacity duration-500"
                style={{
                  top: `${50 + 38 * Math.sin(angle)}%`,
                  left: `${50 + 38 * Math.cos(angle)}%`,
                  transform: "translate(-50%, -50%)",
                  opacity: section === 1 ? 1 : 0.3,
                }}
              >
                <div className="w-1 h-1 rounded-full bg-white/60" />
                {section === 1 && (
                  <span className="text-[7px] font-mono text-white/40 whitespace-nowrap">
                    {["5m", "15m", "30m", "1h", "4h", "AI"][i]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          ref={ring1Ref}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div
            className="absolute rounded-full border transition-colors duration-700"
            style={{
              width: "160px",
              height: "160px",
              borderColor: color,
              borderWidth: "1px",
              opacity: 0.6,
            }}
          />
          <div
            className="absolute w-full h-full"
            style={{
              animation: `spin ${section === 3 ? "3s" : "8s"} linear infinite ${section === 3 ? "reverse" : "normal"}`,
            }}
          >
            {[0, 90, 180, 270].map((deg) => (
              <div
                key={`r1-${deg}`}
                className="absolute w-1.5 h-1.5 rounded-full transition-colors duration-700"
                style={{
                  backgroundColor: color,
                  top: `${50 + 50 * Math.sin((deg * Math.PI) / 180)}%`,
                  left: `${50 + 50 * Math.cos((deg * Math.PI) / 180)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              />
            ))}
          </div>
        </div>

        <div
          ref={coreRef}
          className="absolute inset-0 flex items-center justify-center"
          style={{ zIndex: 10 }}
        >
          <div
            className="absolute w-24 h-24 rounded-full transition-colors duration-700"
            style={{
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              filter: "blur(25px)",
              opacity: 0.5,
              animation: "pulse 3s ease-in-out infinite",
            }}
          />
          <div
            className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-700"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${color}, #030303)`,
              boxShadow: `0 0 40px ${colorDim}, inset 0 0 20px ${colorDim}`,
              border: `1px solid ${colorDim}`,
            }}
          >
            <div
              className="w-3 h-3 rounded-full transition-colors duration-700"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 20px ${color}`,
              }}
            />
          </div>
          {section === 1 && state.active_signal_count > 0 && (
            <div
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold font-mono text-black"
              style={{ backgroundColor: color }}
            >
              {state.active_signal_count}
            </div>
          )}
        </div>

        {particles.map((p, i) => (
          <div
            key={`p-${i}`}
            ref={(el) => {
              if (el) particlesRef.current[i] = el;
            }}
            className="absolute top-1/2 left-1/2 rounded-full transition-colors duration-700 pointer-events-none"
            style={{
              backgroundColor: i % 4 === 0 ? color : "rgba(255,255,255,0.5)",
              boxShadow: i % 4 === 0 ? `0 0 8px ${color}` : "none",
              marginLeft: "-2px",
              marginTop: "-2px",
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}

        {section === 1 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={`candle-${i}`}
                className="absolute w-[2px] rounded-full transition-colors duration-700"
                style={{
                  height: `${15 + Math.random() * 20}px`,
                  backgroundColor: i % 2 === 0 ? "rgba(74,222,128,0.4)" : "rgba(248,113,113,0.4)",
                  top: `${20 + i * 15}%`,
                  left: `${10 + i * 20}%`,
                  animation: `float ${3 + i}s ease-in-out ${i * 0.5}s infinite alternate`,
                }}
              />
            ))}
          </div>
        )}

        {section === 2 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <svg width="200" height="200" viewBox="0 0 200 200" className="animate-[spin_60s_linear_infinite]">
              <defs>
                <pattern id="hex" width="28" height="48" patternUnits="userSpaceOnUse">
                  <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z" fill="none" stroke={colorDim} strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="200" height="200" fill="url(#hex)" />
            </svg>
          </div>
        )}

        {section === 3 && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i / 8) * Math.PI * 2;
              return (
                <div
                  key={`burst-${i}`}
                  className="absolute top-1/2 left-1/2 h-[1px] origin-left transition-colors duration-700"
                  style={{
                    width: "180px",
                    background: `linear-gradient(90deg, ${color}, transparent)`,
                    transform: `rotate(${angle}rad)`,
                    opacity: 0.3,
                    animation: `pulse 2s ease-in-out ${i * 0.25}s infinite`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes orbitRing3 {
          from { transform: rotate(0deg) translateX(160px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(160px) rotate(-360deg); }
        }
      `}</style>
    </div>
  );
}
