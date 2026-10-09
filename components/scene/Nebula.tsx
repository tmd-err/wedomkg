"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "./scene-state";
import { makeNebulaTexture } from "./shaders";

const CLOUDS = [
  { c: "rgba(90,60,180,", x: -14, y: 6, z: -30, s: 34 }, // violet
  { c: "rgba(30,70,160,", x: 16, y: -8, z: -44, s: 42 }, // deep blue
  { c: "rgba(20,120,140,", x: -18, y: -10, z: -58, s: 38 }, // teal
  { c: "rgba(120,60,140,", x: 12, y: 10, z: -52, s: 30 }, // magenta hint
  { c: "rgba(160,90,40,", x: 0, y: -14, z: -36, s: 26 }, // warm amber echo
] as const;

/**
 * Nebula clouds — a handful of enormous soft sprites far behind the action,
 * tinting the void violet/blue/teal. They drift almost imperceptibly and
 * slide with scroll so the cosmos feels layered, not flat black.
 */
export default function Nebula() {
  const group = useRef<THREE.Group>(null);
  const textures = useMemo(
    () => CLOUDS.map((c) => makeNebulaTexture(c.c)),
    [],
  );

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const p = sceneState.progress;
    const reduced = sceneState.reducedMotion;

    // Nebulae are far away — they parallax slower than everything else.
    g.position.z = p * 4;
    if (!reduced) {
      g.rotation.z = Math.sin(t * 0.02) * 0.02;
      g.position.x = Math.sin(t * 0.03) * 0.6;
    }
  });

  return (
    <group ref={group}>
      {CLOUDS.map((c, i) => (
        <sprite
          key={i}
          position={[c.x, c.y, c.z]}
          scale={[c.s, c.s, 1]}
        >
          <spriteMaterial
            map={textures[i]}
            transparent
            opacity={0.35}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
      ))}
    </group>
  );
}
