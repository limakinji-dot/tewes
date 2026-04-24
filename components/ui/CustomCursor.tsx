"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    if (!mq.matches) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const dot = dotRef.current;
    const trail = trailRef.current;
    if (!dot || !trail) return;

    let ticking = false;

    const onMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
          ticking = false;
        });
      }
    };

    const loop = () => {
      trailPos.current.x += (pos.current.x - trailPos.current.x) * 0.12;
      trailPos.current.y += (pos.current.y - trailPos.current.y) * 0.12;
      trail.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px) translate(-50%, -50%)`;
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    const onEnter = () => {
      dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(0.5)`;
      trail.style.opacity = "0.2";
      trail.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px) translate(-50%, -50%) scale(1.8)`;
    };
    const onLeave = () => {
      dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%) scale(1)`;
      trail.style.opacity = "0.5";
      trail.style.transform = `translate(${trailPos.current.x}px, ${trailPos.current.y}px) translate(-50%, -50%) scale(1)`;
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    const interactives = document.querySelectorAll("a,button,[role='button'],.shimmer-card");
    interactives.forEach(el => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMove);
      interactives.forEach(el => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div ref={dotRef} className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference will-change-transform"
        style={{ transform: "translate(-100px,-100px)" }}>
        <div className="w-2 h-2 rounded-full bg-white" />
      </div>
      <div ref={trailRef} className="fixed top-0 left-0 z-[9998] pointer-events-none will-change-transform transition-opacity duration-300"
        style={{ transform: "translate(-100px,-100px)", opacity: 0.5 }}>
        <div className="w-8 h-8 rounded-full border border-white/30" />
      </div>
    </>
  );
}
