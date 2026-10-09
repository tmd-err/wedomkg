"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import SceneLights from "./SceneLights";
import Rig from "./Rig";
import StarField from "./StarField";
import Nebula from "./Nebula";
import Destinations from "./Destinations";
import Sun from "./Sun";
import ProjectScreens from "./ProjectScreens";
import TrustOrbit from "./TrustOrbit";

export default function MarketingScene() {
  return (
    <div className="scene-root" aria-hidden="true">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ fov: 44, position: [0, 0.15, 8.5], near: 0.1, far: 110 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={() => {
          window.dispatchEvent(new Event("wedomkg:scene-ready"));
        }}
      >
        <fog attach="fog" args={["#060910", 16, 64]} />
        <Suspense fallback={null}>
          <SceneLights />
          <Rig />
          <StarField />
          <Nebula />
          <Destinations />
          <Sun />
          <ProjectScreens />
          <TrustOrbit />
        </Suspense>
      </Canvas>
    </div>
  );
}
