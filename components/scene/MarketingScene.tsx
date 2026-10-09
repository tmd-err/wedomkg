"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import SceneLights from "./SceneLights";
import Rig from "./Rig";
import Funnel from "./Funnel";
import ProjectScreens from "./ProjectScreens";
import TrustOrbit from "./TrustOrbit";

export default function MarketingScene() {
  return (
    <div className="scene-root" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 44, position: [0, 0.15, 8.5], near: 0.1, far: 70 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={() => {
          window.dispatchEvent(new Event("wedomkg:scene-ready"));
        }}
      >
        <fog attach="fog" args={["#0a0908", 10, 44]} />
        <Suspense fallback={null}>
          <SceneLights />
          <Rig />
          <Funnel />
          <ProjectScreens />
          <TrustOrbit />
        </Suspense>
      </Canvas>
    </div>
  );
}
