"use client";

import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { Suspense } from "react";
import * as THREE from "three";
import TradingCore from "./TradingCore";

export default function Scene({
  scrollProgress,
  section,
}: {
  scrollProgress: number;
  section: number;
}) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <TradingCore scrollProgress={scrollProgress} section={section} />
          <EffectComposer>
            <Bloom
              intensity={1.2}
              luminanceThreshold={0.2}
              luminanceSmoothing={0.9}
            />
            <ChromaticAberration offset={new THREE.Vector2(0.001, 0.001)} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  );
}
