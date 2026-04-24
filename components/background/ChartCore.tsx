"use client";

import { useEffect, useRef, useMemo } from "react";
import { useTrading } from "@/hooks/useTradingContext";
import gsap from "gsap";

const SIZE = 400;
const PAD = 36;
const CW = SIZE - PAD * 2;
const CH = SIZE - PAD * 2;

// ── Helpers ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Static data generators (called once) ─────────────────────────────────────

function genPriceLine(n = 90): number[] {
  const data: number[] = [];
  let p = 0.52;
  for (let i = 0; i < n; i++) {
    p = Math.max(0.08, Math.min(0.92, p + (Math.random() - 0.46) * 0.035));
    data.push(p);
  }
  return data;
}

function genCandles(n = 28) {
  const data: { o: number; h: number; l: number; c: number; win: boolean }[] = [];
  let p = 0.48;
  for (let i = 0; i < n; i++) {
    const d = (Math.random() - 0.46) * 0.055;
    const o = p, c = p + d;
    const w = Math.abs(d) * (0.3 + Math.random() * 0.7);
    data.push({ o, c, h: Math.max(o, c) + w, l: Math.min(o, c) - w, win: c > o });
    p = c;
  }
  return data;
}

function genEquity(n = 55): number[] {
  const data: number[] = [0];
  for (let i = 1; i < n; i++) {
    const prev = data[i - 1];
    data.push(prev + (Math.random() > 0.39 ? 1 : -0.6) * (Math.random() * 1.8 + 0.4));
  }
  return data;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ChartCore({ section }: { section: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { latestTheme, state } = useTrading();
  const colorRef = useRef("#60a5fa");

  const color = useMemo(
    () =>
      latestTheme === "profit"
        ? "#4ade80"
        : latestTheme === "loss"
        ? "#f87171"
        : "#60a5fa",
    [latestTheme]
  );

  // Keep colorRef in sync for canvas draw loop
  useEffect(() => { colorRef.current = color; }, [color]);

  // ── GSAP position / scale per section ─────────────────────────────────────
  useEffect(() => {
    if (!wrapRef.current) return;
    const tl = gsap.timeline({ defaults: { duration: 1.3, ease: "power3.inOut" } });
    switch (section) {
      case 0:
        tl.to(wrapRef.current, { x: 0, y: 0, scale: 1, opacity: 0.88 });
        break;
      case 1:
        tl.to(wrapRef.current, { x: "-22vw", y: 0, scale: 0.82, opacity: 0.72 });
        break;
      case 2:
        tl.to(wrapRef.current, { x: 0, y: "8vh", scale: 0.65, opacity: 0.4 });
        break;
      case 3:
        tl.to(wrapRef.current, { x: "18vw", y: 0, scale: 1.06, opacity: 0.92 });
        break;
    }
  }, [section]);

  // ── Canvas animation ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(devicePixelRatio, 2);
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    ctx.scale(DPR, DPR);

    let raf: number;
    let t = 0;
    let equityProgress = 0; // animate equity draw-in

    // Pre-generate static data once per mount
    const priceLine = genPriceLine();
    const candles = genCandles();
    const equity = genEquity();
    const eqMin = Math.min(...equity);
    const eqMax = Math.max(...equity);

    // Signal markers on price line
    const signalMarkers = [9, 20, 35, 52, 68].map((idx, i) => ({
      idx,
      long: i % 2 === 0,
    }));

    // ── Draw helpers ───────────────────────────────────────────────────────
    const drawPanel = (hexColor: string) => {
      // Background
      ctx.fillStyle = "rgba(4,3,14,0.8)";
      roundRectPath(ctx, 0, 0, SIZE, SIZE, 20);
      ctx.fill();

      // Border
      ctx.strokeStyle = hexToRgba(hexColor, 0.16);
      ctx.lineWidth = 1;
      roundRectPath(ctx, 0.5, 0.5, SIZE - 1, SIZE - 1, 20);
      ctx.stroke();

      // Corner brackets (terminal aesthetic)
      const ca = 22;
      ctx.strokeStyle = hexToRgba(hexColor, 0.4);
      ctx.lineWidth = 1.5;
      // TL
      ctx.beginPath(); ctx.moveTo(12, 12 + ca); ctx.lineTo(12, 12); ctx.lineTo(12 + ca, 12); ctx.stroke();
      // TR
      ctx.beginPath(); ctx.moveTo(SIZE - 12 - ca, 12); ctx.lineTo(SIZE - 12, 12); ctx.lineTo(SIZE - 12, 12 + ca); ctx.stroke();
      // BL
      ctx.beginPath(); ctx.moveTo(12, SIZE - 12 - ca); ctx.lineTo(12, SIZE - 12); ctx.lineTo(12 + ca, SIZE - 12); ctx.stroke();
      // BR
      ctx.beginPath(); ctx.moveTo(SIZE - 12 - ca, SIZE - 12); ctx.lineTo(SIZE - 12, SIZE - 12); ctx.lineTo(SIZE - 12, SIZE - 12 - ca); ctx.stroke();
    };

    const drawHeader = (label: string, hexColor: string, live: boolean) => {
      ctx.fillStyle = hexToRgba(hexColor, 0.42);
      ctx.font = "bold 8px 'Courier New', monospace";
      ctx.fillText(label, PAD, PAD - 12);

      if (live) {
        const pulse = (Math.sin(t * 3.5) + 1) / 2;
        // Glow ring
        ctx.fillStyle = hexToRgba(hexColor, pulse * 0.28);
        ctx.beginPath();
        ctx.arc(SIZE - PAD, PAD - 14, 5 + pulse * 4, 0, Math.PI * 2);
        ctx.fill();
        // Dot
        ctx.fillStyle = hexColor;
        ctx.beginPath();
        ctx.arc(SIZE - PAD, PAD - 14, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawDashedGrid = (hexColor: string, rows = 4, cols = 0) => {
      ctx.strokeStyle = "rgba(255,255,255,0.035)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 6]);
      for (let g = 0; g <= rows; g++) {
        const y = PAD + (g / rows) * CH;
        ctx.beginPath(); ctx.moveTo(PAD, y); ctx.lineTo(PAD + CW, y); ctx.stroke();
      }
      if (cols > 0) {
        for (let g = 0; g <= cols; g++) {
          const x = PAD + (g / cols) * CW;
          ctx.beginPath(); ctx.moveTo(x, PAD); ctx.lineTo(x, PAD + CH); ctx.stroke();
        }
      }
      ctx.setLineDash([]);
    };

    // ── Section 0: Animated price line with signal markers ─────────────────
    const drawPriceLine = (hexColor: string) => {
      drawHeader("BTC/USDT  PERP  1H", hexColor, true);
      drawDashedGrid(hexColor, 4, 5);

      const lo = Math.min(...priceLine) - 0.06;
      const hi = Math.max(...priceLine) + 0.06;
      const rng = hi - lo;
      const toX = (i: number) => PAD + (i / (priceLine.length - 1)) * CW;
      const toY = (v: number) => PAD + CH - ((v - lo) / rng) * CH;

      // Area gradient
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(priceLine[0]));
      priceLine.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
      ctx.lineTo(toX(priceLine.length - 1), PAD + CH);
      ctx.lineTo(toX(0), PAD + CH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, PAD, 0, PAD + CH);
      grad.addColorStop(0, hexToRgba(hexColor, 0.18));
      grad.addColorStop(0.7, hexToRgba(hexColor, 0.04));
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fill();

      // Price line
      ctx.beginPath();
      ctx.strokeStyle = hexColor;
      ctx.lineWidth = 1.8;
      priceLine.forEach((v, i) => {
        const x = toX(i), y = toY(v);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Animated tip dot
      const last = priceLine[priceLine.length - 1];
      const lx = toX(priceLine.length - 1);
      const ly = toY(last);
      const pulse = (Math.sin(t * 4) + 1) / 2;
      ctx.fillStyle = hexToRgba(hexColor, 0.2 + pulse * 0.12);
      ctx.beginPath(); ctx.arc(lx, ly, 9 + pulse * 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = hexColor;
      ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2); ctx.fill();

      // Live price label
      const labelX = PAD + CW + 5;
      ctx.fillStyle = hexToRgba(hexColor, 0.2);
      ctx.fillRect(labelX - 2, ly - 9, 52, 18);
      ctx.strokeStyle = hexToRgba(hexColor, 0.3);
      ctx.lineWidth = 0.5;
      ctx.strokeRect(labelX - 2, ly - 9, 52, 18);
      ctx.fillStyle = hexColor;
      ctx.font = "bold 8px monospace";
      ctx.fillText("43,218", labelX + 1, ly + 3.5);

      // Signal markers
      signalMarkers.forEach(({ idx, long }) => {
        const mx = toX(idx);
        const my = toY(priceLine[idx]);
        const arrowColor = long ? "#4ade80" : "#f87171";
        ctx.fillStyle = arrowColor + "cc";
        ctx.beginPath();
        if (long) {
          // upward triangle, below line
          ctx.moveTo(mx, my + 14);
          ctx.lineTo(mx - 5, my + 22);
          ctx.lineTo(mx + 5, my + 22);
        } else {
          // downward triangle, above line
          ctx.moveTo(mx, my - 14);
          ctx.lineTo(mx - 5, my - 22);
          ctx.lineTo(mx + 5, my - 22);
        }
        ctx.closePath();
        ctx.fill();
        // stem
        ctx.strokeStyle = arrowColor + "88";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        if (long) { ctx.moveTo(mx, my); ctx.lineTo(mx, my + 13); }
        else { ctx.moveTo(mx, my); ctx.lineTo(mx, my - 13); }
        ctx.stroke();
      });
    };

    // ── Section 1: Order book depth chart ─────────────────────────────────
    const drawOrderBook = (hexColor: string) => {
      drawHeader("ORDER BOOK  DEPTH", hexColor, true);

      const N = 32;
      const midX = PAD + CW / 2;
      const botY = PAD + CH;
      const barW = (CW / 2) / N;

      // Animated bid/ask data
      const bids: number[] = [];
      const asks: number[] = [];
      let b = 0.2;
      for (let i = 0; i < N; i++) {
        b += (0.3 + Math.random() * 0.7) * 0.8;
        bids.push(b + Math.sin(t * 0.4 + i * 0.25) * 0.12);
      }
      let a = 0.2;
      for (let i = 0; i < N; i++) {
        a += (0.3 + Math.random() * 0.7) * 0.8;
        asks.push(a + Math.sin(t * 0.35 + i * 0.3) * 0.1);
      }
      const maxDepth = Math.max(...bids, ...asks);
      const chartH = CH * 0.88;

      // Bid bars (left of center, green)
      for (let i = 0; i < N; i++) {
        const bh = (bids[i] / maxDepth) * chartH;
        const x = midX - (i + 1) * barW;
        const alpha = 0.06 + (1 - i / N) * 0.1;
        ctx.fillStyle = `rgba(74,222,128,${alpha})`;
        ctx.fillRect(x, botY - bh, barW - 0.5, bh);
      }
      // Bid outline
      ctx.beginPath();
      ctx.strokeStyle = "rgba(74,222,128,0.45)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < N; i++) {
        const bh = (bids[i] / maxDepth) * chartH;
        const x = midX - (i + 1) * barW;
        if (i === 0) ctx.moveTo(midX, botY);
        ctx.lineTo(midX - i * barW, botY - bh);
        ctx.lineTo(x, botY - bh);
      }
      ctx.stroke();

      // Ask bars (right of center, red)
      for (let i = 0; i < N; i++) {
        const bh = (asks[i] / maxDepth) * chartH;
        const x = midX + i * barW;
        const alpha = 0.06 + (1 - i / N) * 0.1;
        ctx.fillStyle = `rgba(248,113,113,${alpha})`;
        ctx.fillRect(x, botY - bh, barW - 0.5, bh);
      }
      // Ask outline
      ctx.beginPath();
      ctx.strokeStyle = "rgba(248,113,113,0.45)";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < N; i++) {
        const bh = (asks[i] / maxDepth) * chartH;
        const x = midX + i * barW;
        if (i === 0) ctx.moveTo(midX, botY);
        ctx.lineTo(midX + i * barW, botY - bh);
        ctx.lineTo(x + barW, botY - bh);
      }
      ctx.stroke();

      // Center mid-price line
      ctx.strokeStyle = hexToRgba(hexColor, 0.35);
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 5]);
      ctx.beginPath(); ctx.moveTo(midX, PAD + 4); ctx.lineTo(midX, botY); ctx.stroke();
      ctx.setLineDash([]);

      // Mid price label
      ctx.fillStyle = hexToRgba(hexColor, 0.18);
      ctx.fillRect(midX - 24, PAD + 4, 48, 16);
      ctx.fillStyle = hexColor;
      ctx.font = "bold 8px monospace";
      ctx.textAlign = "center";
      ctx.fillText("43,218", midX, PAD + 15);
      ctx.textAlign = "left";

      // BID / ASK labels
      ctx.fillStyle = "rgba(74,222,128,0.45)";
      ctx.font = "7px monospace";
      ctx.fillText("BIDS", PAD + 2, botY - 4);
      ctx.fillStyle = "rgba(248,113,113,0.45)";
      ctx.fillText("ASKS", SIZE - PAD - 26, botY - 4);

      // Active signals badge
      const activeCount = state.active_signal_count;
      if (activeCount > 0) {
        ctx.fillStyle = hexColor;
        ctx.font = `bold ${activeCount > 9 ? 22 : 26}px 'Courier New', monospace`;
        ctx.textAlign = "center";
        ctx.fillText(`${activeCount}`, SIZE / 2, SIZE / 2 + 8);
        ctx.font = "7px monospace";
        ctx.fillStyle = hexToRgba(hexColor, 0.38);
        ctx.fillText("ACTIVE SIGNALS", SIZE / 2, SIZE / 2 + 22);
        ctx.textAlign = "left";
      }
    };

    // ── Section 2: Candlestick chart with win/loss dots ────────────────────
    const drawCandleChart = (hexColor: string) => {
      drawHeader("TRADE HISTORY", hexColor, false);
      drawDashedGrid(hexColor, 3, 0);

      const allPx = candles.flatMap((c) => [c.h, c.l]);
      const lo = Math.min(...allPx);
      const hi = Math.max(...allPx);
      const rng = hi - lo || 0.01;
      const toY = (v: number) =>
        PAD + CH - ((v - lo + rng * 0.06) / (rng * 1.12)) * CH;

      const cStep = CW / candles.length;
      const cBodyW = cStep * 0.52;

      candles.forEach((c, i) => {
        const cx = PAD + i * cStep + (cStep - cBodyW) / 2;
        const up = c.c >= c.o;
        const alpha = 0.55;
        const col = up ? `rgba(74,222,128,${alpha})` : `rgba(248,113,113,${alpha})`;

        // Wick
        ctx.strokeStyle = col;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(cx + cBodyW / 2, toY(c.h));
        ctx.lineTo(cx + cBodyW / 2, toY(c.l));
        ctx.stroke();

        // Body
        const bodyTop = toY(Math.max(c.o, c.c));
        const bodyH = Math.max(1.5, toY(Math.min(c.o, c.c)) - bodyTop);
        ctx.fillStyle = col;
        ctx.fillRect(cx, bodyTop, cBodyW, bodyH);

        // Win marker dot above wick
        if (up) {
          ctx.fillStyle = "rgba(74,222,128,0.65)";
          ctx.beginPath();
          ctx.arc(cx + cBodyW / 2, toY(c.h) - 5, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Stats overlay
      const wins = candles.filter((c) => c.win).length;
      const total = candles.length;
      const wr = Math.round((wins / total) * 100);
      ctx.fillStyle = hexToRgba(hexColor, 0.55);
      ctx.font = `bold 22px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${wr}%`, SIZE / 2, PAD + 24);
      ctx.font = "7px monospace";
      ctx.fillStyle = hexToRgba(hexColor, 0.3);
      ctx.fillText("WIN RATE", SIZE / 2, PAD + 36);
      ctx.textAlign = "left";
    };

    // ── Section 3: Portfolio equity curve ─────────────────────────────────
    const drawEquityCurve = (hexColor: string) => {
      drawHeader("EQUITY CURVE", hexColor, false);
      drawDashedGrid(hexColor, 3, 0);

      equityProgress = Math.min(equity.length - 1, equityProgress + 0.45);
      const visIdx = Math.floor(equityProgress);
      const visSlice = equity.slice(0, visIdx + 1);
      if (visSlice.length < 2) return;

      const normSlice = visSlice.map(
        (v) => (v - eqMin) / (eqMax - eqMin + 0.01)
      );
      const toX = (i: number) => PAD + (i / (equity.length - 1)) * CW;
      const toY = (v: number) => PAD + CH - v * CH * 0.88;

      // Area fill
      ctx.beginPath();
      ctx.moveTo(toX(0), toY(normSlice[0]));
      normSlice.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
      ctx.lineTo(toX(visSlice.length - 1), PAD + CH);
      ctx.lineTo(toX(0), PAD + CH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, PAD, 0, PAD + CH);
      grad.addColorStop(0, hexToRgba(hexColor, 0.22));
      grad.addColorStop(0.65, hexToRgba(hexColor, 0.06));
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fill();

      // Curve line
      ctx.beginPath();
      ctx.strokeStyle = hexColor;
      ctx.lineWidth = 2;
      normSlice.forEach((v, i) => {
        const x = toX(i), y = toY(v);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Animated tip dot
      const lastV = normSlice[normSlice.length - 1];
      const tipX = toX(normSlice.length - 1);
      const tipY = toY(lastV);
      const pulse = (Math.sin(t * 4) + 1) / 2;
      ctx.fillStyle = hexToRgba(hexColor, 0.22 * pulse);
      ctx.beginPath(); ctx.arc(tipX, tipY, 8 + pulse * 3, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = hexColor;
      ctx.beginPath(); ctx.arc(tipX, tipY, 3.5, 0, Math.PI * 2); ctx.fill();

      // Return label
      const pnl = state.total_pnl_pct;
      const displayPnl = pnl !== 0 ? pnl : (equity[equity.length - 1] - equity[0]) * 3;
      const sign = displayPnl >= 0 ? "+" : "";
      ctx.fillStyle = hexColor;
      ctx.font = `bold 24px 'Courier New', monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${sign}${displayPnl.toFixed(2)}%`, SIZE / 2, PAD + 26);
      ctx.fillStyle = hexToRgba(hexColor, 0.35);
      ctx.font = "7px monospace";
      ctx.fillText("TOTAL RETURN", SIZE / 2, PAD + 38);
      ctx.textAlign = "left";

      // Baseline
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 6]);
      ctx.beginPath();
      ctx.moveTo(PAD, PAD + CH);
      ctx.lineTo(PAD + CW, PAD + CH);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // ── Main draw loop ────────────────────────────────────────────────────
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, SIZE, SIZE);

      const hexColor = colorRef.current;

      drawPanel(hexColor);

      switch (section) {
        case 0: drawPriceLine(hexColor); break;
        case 1: drawOrderBook(hexColor); break;
        case 2: drawCandleChart(hexColor); break;
        case 3: drawEquityCurve(hexColor); break;
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]); // re-init canvas on section change; color flows through colorRef

  return (
    <div
      className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={wrapRef}
        className="relative"
        style={{ willChange: "transform", opacity: 0.88 }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: SIZE,
            height: SIZE,
            // Subtle shadow matching theme color via box-shadow won't work on canvas,
            // but the canvas draws its own glow internally
          }}
        />
      </div>
    </div>
  );
}
