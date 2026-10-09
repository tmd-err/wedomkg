"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "./scene-state";
import { hash, makeDotTexture } from "./shaders";

/**
 * Deep space: three shells of stars at different depths. Each layer drifts
 * toward the camera at a different rate as the page scrolls — parallax that
 * sells the feeling of flying forward through the universe.
 */
export default function StarField() {
  const near = useRef<THREE.Points>(null);
  const mid = useRef<THREE.Points>(null);
  const far = useRef<THREE.Points>(null);

  const dotTex = useMemo(() => makeDotTexture(), []);

  // [count, shell inner radius, shell outer radius, palette mix]
  const layers = useMemo(() => {
    const white = new THREE.Color("#f4efe4");
    const blue = new THREE.Color("#7ea8ff");
    const violet = new THREE.Color("#b49aff");
    const amber = new THREE.Color("#f5a81c");

    const build = (
      count: number,
      rMin: number,
      rMax: number,
      tinted: number, // every Nth star gets a color
      palette: THREE.Color[],
    ) => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        // uniform shell distribution
        const a = hash(i * 3.7 + rMin) * Math.PI * 2;
        const b = Math.acos(2 * hash(i * 9.1 + rMax) - 1);
        const r = rMin + hash(i * 5.3 + count) * (rMax - rMin);
        pos[i * 3] = r * Math.sin(b) * Math.cos(a);
        pos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a) * 0.7; // flatten slightly
        pos[i * 3 + 2] = r * Math.cos(b);
        const c = i % tinted === 0 ? palette[i % palette.length] : white;
        const dim = 0.55 + hash(i * 13.7) * 0.45;
        col[i * 3] = c.r * dim;
        col[i * 3 + 1] = c.g * dim;
        col[i * 3 + 2] = c.b * dim;
      }
      return { pos, col };
    };

    return {
      far: build(2400, 42, 60, 9, [blue, violet]),
      mid: build(900, 24, 40, 6, [blue, violet, amber]),
      near: build(320, 10, 22, 4, [amber, blue]),
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = sceneState.progress;
    const reduced = sceneState.reducedMotion;
    const drift = reduced ? 0.3 : 1;

    // Scroll pulls the layers closer — nearest moves fastest (parallax).
    // A bounded sway keeps space alive without drifting past the camera.
    const sway = reduced ? 0 : 1;
    if (far.current) {
      far.current.position.z = p * 3 + Math.sin(t * 0.05) * 0.4 * sway;
      far.current.rotation.z = t * 0.004 * drift;
    }
    if (mid.current) {
      mid.current.position.z = p * 8 + Math.sin(t * 0.09 + 2) * 0.6 * sway;
      mid.current.rotation.z = -t * 0.006 * drift;
    }
    if (near.current) {
      near.current.position.z = p * 16 + Math.sin(t * 0.13 + 4) * 1.0 * sway;
      near.current.rotation.z = t * 0.01 * drift;
    }
  });

  return (
    <group>
      <points ref={far} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layers.far.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[layers.far.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={dotTex}
          size={0.16}
          vertexColors
          transparent
          opacity={0.85}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <points ref={mid} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layers.mid.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[layers.mid.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={dotTex}
          size={0.11}
          vertexColors
          transparent
          opacity={0.75}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </points>
      {/* near dust — the fast layer, reads as motion */}
      <points ref={near} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[layers.near.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[layers.near.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          map={dotTex}
          size={0.055}
          vertexColors
          transparent
          opacity={0.55}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </points>
    </group>
  );
}
