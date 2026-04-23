"use client";

import { useRef, useEffect, useState } from "react";
import { useTrading } from "@/hooks/useTradingContext";
import gsap from "gsap";

export default function QuantumCore({ section }: { section: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { latestTheme } = useTrading();
  const [activeMode, setActiveMode] = useState(0);

  const color =
    latestTheme === "profit" ? "#4ade80" : latestTheme === "loss" ? "#f87171" : "#60a5fa";
  const colorDim =
    latestTheme === "profit" ? "rgba(74,222,128,0.15)" : latestTheme === "loss" ? "rgba(248,113,113,0.15)" : "rgba(96,165,250,0.15)";

  // Position & scale morph berdasarkan section
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    setActiveMode(section);

    switch (section) {
      case 0:
        gsap.to(el, { x: 0, scale: 1, opacity: 1, duration: 1, ease: "power3.out" });
        break;
      case 1:
        gsap.to(el, { x: "-18vw", scale: 0.85, opacity: 1, duration: 1, ease: "power3.out" });
        break;
      case 2:
        gsap.to(el, { x: 0, scale: 0.9, opacity: 1, duration: 1, ease: "power3.out" });
        break;
      case 3:
        gsap.to(el, { x: 0, scale: 1.1, opacity: 1, duration: 1.2, ease: "power3.out" });
        break;
    }
  }, [section]);

  // Canvas animation for Mode 1 (Pulse/Chart)
  useEffect(() => {
    if (section !== 1 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 320;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;
    let animId: number;

    const candles: number[] = [];
    for (let i = 0; i < 20; i++) candles.push(50 + Math.random() * 100);

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      frame++;

      // Draw circular waveform
      const cx = size / 2;
      const cy = size / 2;
      const radius = 90;

      ctx.strokeStyle = colorDim;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= 360; i += 2) {
        const rad = (i * Math.PI) / 180;
        const r = radius + Math.sin(i * 0.1 + frame * 0.03) * 15 + Math.sin(i * 0.05 + frame * 0.02) * 10;
        const x = cx + Math.cos(rad) * r;
        const y = cy + Math.sin(rad) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw inner candlesticks
      const candleWidth = 6;
      const gap = 4;
      const totalW = candles.length * (candleWidth + gap);
      const startX = cx - totalW / 2;

      candles.forEach((h, i) => {
        const x = startX + i * (candleWidth + gap);
        const isGreen = i % 3 !== 0;
        const h2 = h + Math.sin(frame * 0.05 + i) * 10;

        ctx.fillStyle = isGreen ? "rgba(74,222,128,0.6)" : "rgba(248,113,113,0.6)";
        ctx.fillRect(x, cy - h2 / 2, candleWidth, h2);

        // Wick
        ctx.strokeStyle = isGreen ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(x + candleWidth / 2, cy - h2 / 2 - 8);
        ctx.lineTo(x + candleWidth / 2, cy + h2 / 2 + 8);
        ctx.stroke();
      });

      // Center orb
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [section, color, colorDim]);

  // Mode 3 (Nova) canvas - radial gauge
  useEffect(() => {
    if (section !== 3 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 360;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let frame = 0;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      frame++;
      const cx = size / 2;
      const cy = size / 2;

      // Outer rings
      for (let r = 100; r <= 140; r += 20) {
        ctx.strokeStyle = colorDim;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Sweeping arc
      const sweepAngle = (frame * 0.02) % (Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(cx, cy, 120, sweepAngle, sweepAngle + Math.PI * 0.8);
      ctx.stroke();

      // Particles burst
      for (let i = 0; i < 12; i++) {
        const angle = (frame * 0.01 + (i * Math.PI * 2) / 12);
        const dist = 80 + Math.sin(frame * 0.03 + i) * 40;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;
        const r = 2 + Math.sin(frame * 0.05 + i) * 1;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.4 + Math.sin(frame * 0.04 + i) * 0.4;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Center text
      ctx.fillStyle = "#fff";
      ctx.font = "700 14px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(latestTheme === "profit" ? "PROFIT" : latestTheme === "loss" ? "LOSS" : "AGENT-X", cx, cy);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, [section, color, colorDim, latestTheme]);

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
      <div
        ref={containerRef}
        className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]"
      >
        {/* ── MODE 0: THE NUCLEUS (Hero) ── */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${
            activeMode === 0 ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          {/* Outer rotating wireframe rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="absolute w-full h-full rounded-full border border-white/[0.06]"
              style={{ animation: "spin 20s linear infinite", transformStyle: "preserve-3d" }}
            />
            <div
              className="absolute w-[85%] h-[85%] rounded-full border border-dashed border-white/[0.04]"
              style={{ animation: "spin 15s linear infinite reverse" }}
            />
            <div
              className="absolute w-[70%] h-[70%] rounded-full border border-white/[0.08]"
              style={{ animation: "spin 10s linear infinite" }}
            />
            {/* Tilted ring */}
            <div
              className="absolute w-[90%] h-[90%] rounded-full border border-white/[0.05]"
              style={{
                animation: "spin 25s linear infinite",
                transform: "rotateX(60deg)",
              }}
            />
          </div>

          {/* Geometric vertices (dots on ring) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 10px ${color}`,
                top: `${50 + 45 * Math.sin((deg * Math.PI) / 180)}%`,
                left: `${50 + 45 * Math.cos((deg * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
                animation: `pulse 3s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}

          {/* Core glow */}
          <div
            className="absolute inset-[35%] rounded-full"
            style={{
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              filter: "blur(20px)",
              opacity: 0.5,
              animation: "pulse 4s ease-in-out infinite",
            }}
          />
          <div className="absolute inset-[42%] rounded-full bg-[#030303] border border-white/[0.1] flex items-center justify-center">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 30px ${color}, 0 0 60px ${colorDim}`,
              }}
            />
          </div>
        </div>

        {/* ── MODE 1: THE PULSE (Live Logic) ── */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${
            activeMode === 1 ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          {/* Equalizer bars around */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              const height = 20 + Math.sin(i * 1.5) * 15;
              return (
                <div
                  key={i}
                  className="absolute w-[2px] rounded-full"
                  style={{
                    height: `${height}px`,
                    backgroundColor: i % 2 === 0 ? color : "rgba(255,255,255,0.1)",
                    transform: `rotate(${angle}rad) translateY(-110px)`,
                    transformOrigin: "center 110px",
                    animation: `pulse ${2 + Math.random()}s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              );
            })}
          </div>

          {/* Canvas chart */}
          <canvas
            ref={canvasRef}
            width={320}
            height={320}
            className="absolute inset-0 w-full h-full"
            style={{ opacity: 1 }}
          />

          {/* Orbiting data packets */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/60"
              style={{
                top: "50%",
                left: "50%",
                animation: `orbit${i} ${8 + i * 2}s linear infinite`,
              }}
            />
          ))}
        </div>

        {/* ── MODE 2: THE VAULT (History) ── */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${
            activeMode === 2 ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Hexagonal honeycomb grid */}
            {[
              { x: 0, y: 0, s: 1 },
              { x: -60, y: -35, s: 0.8 },
              { x: 60, y: -35, s: 0.8 },
              { x: -60, y: 35, s: 0.8 },
              { x: 60, y: 35, s: 0.8 },
              { x: 0, y: -70, s: 0.6 },
              { x: 0, y: 70, s: 0.6 },
              { x: -120, y: 0, s: 0.6 },
              { x: 120, y: 0, s: 0.6 },
            ].map((h, i) => (
              <div
                key={i}
                className="absolute transition-all"
                style={{
                  width: `${80 * h.s}px`,
                  height: `${80 * h.s}px`,
                  transform: `translate(${h.x}px, ${h.y}px)`,
                  animation: `fadeCell 4s ease-in-out ${i * 0.3}s infinite alternate`,
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <polygon
                    points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                    fill="none"
                    stroke={i === 0 ? color : "rgba(255,255,255,0.08)"}
                    strokeWidth="1"
                  />
                  {i === 0 && (
                    <polygon
                      points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5"
                      fill={colorDim}
                    />
                  )}
                </svg>
                {i > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[8px] font-mono text-white/20">
                      {["TP", "SL", "LONG", "SHORT", "VOID", "EMA", "RSI", "SAR"][i % 8]}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Data stream lines */}
          <div className="absolute inset-0 overflow-hidden rounded-full opacity-20">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
                style={{
                  top: `${25 + i * 16}%`,
                  animation: `stream 3s linear ${i * 0.7}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── MODE 3: THE NOVA (PnL) ── */}
        <div
          className={`absolute inset-0 transition-all duration-700 ${
            activeMode === 3 ? "opacity-100 scale-100" : "opacity-0 scale-75"
          }`}
        >
          <canvas
            ref={canvasRef}
            width={360}
            height={360}
            className="absolute inset-0 w-full h-full"
          />
          {/* Decorative corner brackets */}
          {[
            { t: 0, l: 0, r: "border-r-0 border-b-0" },
            { t: 0, r: 0, l: "border-l-0 border-b-0" },
            { b: 0, l: 0, r: "border-r-0 border-t-0" },
            { b: 0, r: 0, l: "border-l-0 border-t-0" },
          ].map((pos, i) => (
            <div
              key={i}
              className={`absolute w-8 h-8 border-2 ${pos.r || pos.l} border-white/10`}
              style={{
                top: pos.t !== undefined ? "15%" : undefined,
                bottom: pos.b !== undefined ? "15%" : undefined,
                left: pos.l !== undefined ? "15%" : undefined,
                right: pos.r !== undefined ? "15%" : undefined,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes orbit0 {
          from { transform: rotate(0deg) translateX(100px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
        }
        @keyframes orbit1 {
          from { transform: rotate(60deg) translateX(120px) rotate(-60deg); }
          to { transform: rotate(420deg) translateX(120px) rotate(-420deg); }
        }
        @keyframes orbit2 {
          from { transform: rotate(120deg) translateX(90px) rotate(-120deg); }
          to { transform: rotate(480deg) translateX(90px) rotate(-480deg); }
        }
        @keyframes orbit3 {
          from { transform: rotate(180deg) translateX(110px) rotate(-180deg); }
          to { transform: rotate(540deg) translateX(110px) rotate(-540deg); }
        }
        @keyframes orbit4 {
          from { transform: rotate(240deg) translateX(130px) rotate(-240deg); }
          to { transform: rotate(600deg) translateX(130px) rotate(-600deg); }
        }
        @keyframes orbit5 {
          from { transform: rotate(300deg) translateX(95px) rotate(-300deg); }
          to { transform: rotate(660deg) translateX(95px) rotate(-660deg); }
        }
        @keyframes fadeCell {
          0% { opacity: 0.3; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(0.95); }
          100% { opacity: 1; transform: translate(var(--tw-translate-x), var(--tw-translate-y)) scale(1.05); }
        }
        @keyframes stream {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
