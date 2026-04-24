"use client";

import { useEffect, useRef } from "react";

interface CandleData {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

function generateCandles(n: number): CandleData[] {
  const out: CandleData[] = [];
  let p = 42000 + Math.random() * 12000;
  for (let i = 0; i < n; i++) {
    const vol = p * 0.009;
    const drift = (Math.random() - 0.465) * vol;
    const o = p;
    const c = p + drift;
    const wick = Math.abs(drift) * (0.4 + Math.random() * 0.8);
    out.push({
      o,
      c,
      h: Math.max(o, c) + wick * Math.random(),
      l: Math.min(o, c) - wick * Math.random(),
      v: 0.15 + Math.random() * 0.85,
    });
    p = c;
  }
  return out;
}

export default function TradingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const TOTAL = 280;
    const candles = generateCandles(TOTAL);

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    let mx = -1, my = -1;
    const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; };
    const onLeave = () => { mx = -1; my = -1; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);

    const STEP = 18;  // total candle slot width
    const BODY = 11;  // candle body width
    let scrollOffset = 0;
    let raf: number;

    const frame = () => {
      ctx.clearRect(0, 0, W, H);

      // Advance scroll
      scrollOffset = (scrollOffset + 0.22) % STEP;

      const visibleCount = Math.ceil(W / STEP) + 2;
      // Slowly advance through candle history over time
      const timeAdvance = Math.floor(Date.now() / 3500) % Math.max(1, TOTAL - visibleCount);
      const slice = candles.slice(timeAdvance, timeAdvance + visibleCount);

      if (slice.length < 2) { raf = requestAnimationFrame(frame); return; }

      // Price range of visible candles
      const allPx = slice.flatMap((c) => [c.h, c.l]);
      const lo = Math.min(...allPx);
      const hi = Math.max(...allPx);
      const rng = hi - lo || 1;
      const pad = rng * 0.2;

      const chartTop = H * 0.07;
      const chartBot = H * 0.80;
      const chartH = chartBot - chartTop;

      const toY = (price: number) =>
        chartTop + chartH - ((price - (lo - pad)) / (rng + pad * 2)) * chartH;

      // ── Subtle grid ──────────────────────────────────────────────────────
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(255,255,255,0.022)";
      for (let gx = 0; gx < W; gx += 80) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (let gy = 0; gy < H; gy += 55) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }

      // ── EMA line ─────────────────────────────────────────────────────────
      const ema: number[] = [];
      slice.forEach((c, i) => {
        const k = 2 / (12 + 1);
        ema.push(i === 0 ? c.c : c.c * k + ema[i - 1] * (1 - k));
      });
      ctx.beginPath();
      ctx.strokeStyle = "rgba(96,165,250,0.09)";
      ctx.lineWidth = 1.5;
      slice.forEach((_, i) => {
        const x = i * STEP - scrollOffset + BODY / 2;
        const y = toY(ema[i]);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // ── Candles ──────────────────────────────────────────────────────────
      slice.forEach((c, i) => {
        const x = i * STEP - scrollOffset;
        const up = c.c >= c.o;
        const a = 0.1;
        const colFill = up ? `rgba(74,222,128,${a})` : `rgba(248,113,113,${a})`;
        const colBorder = up ? `rgba(74,222,128,${a * 2})` : `rgba(248,113,113,${a * 2})`;

        // Wick
        ctx.strokeStyle = colBorder;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(x + BODY / 2, toY(c.h));
        ctx.lineTo(x + BODY / 2, toY(c.l));
        ctx.stroke();

        // Body
        const bodyTop = toY(Math.max(c.o, c.c));
        const bodyH = Math.max(1.5, toY(Math.min(c.o, c.c)) - bodyTop);
        ctx.fillStyle = colFill;
        ctx.fillRect(x, bodyTop, BODY, bodyH);
        ctx.strokeStyle = colBorder;
        ctx.lineWidth = 0.5;
        ctx.strokeRect(x, bodyTop, BODY, bodyH);
      });

      // ── Volume bars ───────────────────────────────────────────────────────
      const maxV = Math.max(...slice.map((c) => c.v));
      const volAreaH = H * 0.065;
      const volTop = H * 0.866;
      slice.forEach((c, i) => {
        const x = i * STEP - scrollOffset;
        const bh = (c.v / maxV) * volAreaH;
        const up = c.c >= c.o;
        ctx.fillStyle = up ? "rgba(74,222,128,0.05)" : "rgba(248,113,113,0.05)";
        ctx.fillRect(x, volTop + volAreaH - bh, BODY, bh);
      });

      // ── Mouse crosshair ───────────────────────────────────────────────────
      if (mx > 0 && my > 0) {
        ctx.strokeStyle = "rgba(255,255,255,0.055)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(mx, H); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, my); ctx.lineTo(W, my); ctx.stroke();
        ctx.setLineDash([]);

        // Price label on Y axis
        const priceAtMouse =
          (lo - pad) +
          ((chartH - (my - chartTop)) / chartH) * (rng + pad * 2);
        if (my >= chartTop && my <= chartBot) {
          ctx.fillStyle = "rgba(255,255,255,0.06)";
          ctx.fillRect(4, my - 9, 72, 18);
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.font = "10px 'Courier New', monospace";
          ctx.fillText(
            priceAtMouse.toLocaleString("en-US", { maximumFractionDigits: 0 }),
            8,
            my + 4
          );
        }
      }

      // ── Edge fade masks ───────────────────────────────────────────────────
      const fw = 110;
      const leftGrad = ctx.createLinearGradient(0, 0, fw, 0);
      leftGrad.addColorStop(0, "#030303");
      leftGrad.addColorStop(1, "transparent");
      ctx.fillStyle = leftGrad;
      ctx.fillRect(0, 0, fw, H);

      const rightGrad = ctx.createLinearGradient(W - fw, 0, W, 0);
      rightGrad.addColorStop(0, "transparent");
      rightGrad.addColorStop(1, "#030303");
      ctx.fillStyle = rightGrad;
      ctx.fillRect(W - fw, 0, fw, H);

      const topGrad = ctx.createLinearGradient(0, 0, 0, 60);
      topGrad.addColorStop(0, "#030303");
      topGrad.addColorStop(1, "transparent");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, 60);

      const botGrad = ctx.createLinearGradient(0, H - 40, 0, H);
      botGrad.addColorStop(0, "transparent");
      botGrad.addColorStop(1, "#030303");
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, H - 40, W, 40);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none bg-[#030303]"
    />
  );
}
