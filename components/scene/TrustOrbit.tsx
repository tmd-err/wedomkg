"use client";

import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { sceneState, windowBand } from "./scene-state";
import { TRUST_LOGOS } from "@/data/trust";

const RX = 3.3;
const RZ = 1.9;
const PLANE_W = 1.35;
const ORBIT_Y = -1.35;

/**
 * Client marks on transparent planes, gently orbiting the core. Logos stay
 * billboarded and readable — this section is about confidence, not noise.
 */
export default function TrustOrbit() {
  const group = useRef<THREE.Group>(null);
  const holders = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const textures = useTexture(TRUST_LOGOS.map((l) => l.image));

  useLayoutEffect(() => {
    textures.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
    });
  }, [textures]);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const lp = sceneState.trust;

    const vis = windowBand(lp, 0.06, 0.2, 0.8, 0.95);
    g.visible = vis > 0.003;
    if (!g.visible) return;

    const drift = sceneState.reducedMotion ? 0 : t * 0.08;
    const rot = lp * Math.PI + drift;
    const total = TRUST_LOGOS.length;

    for (let i = 0; i < total; i++) {
      const holder = holders.current[i];
      const mat = mats.current[i];
      if (!holder || !mat) continue;
      const a = (i / total) * Math.PI * 2 + rot;
      holder.position.set(
        Math.sin(a) * RX,
        ORBIT_Y + Math.sin(i * 2.1) * 0.75,
        0.4 + Math.cos(a) * RZ,
      );
      const facing = (Math.cos(a) + 1) / 2; // front items read brighter
      mat.opacity = vis * (0.07 + 0.85 * facing * facing);
    }
  });

  return (
    <group ref={group} visible={false}>
      {TRUST_LOGOS.map((logo, i) => {
        const tex = textures[i];
        const img = tex.image as { width?: number; height?: number } | undefined;
        const aspect =
          img && img.width && img.height ? img.width / img.height : 2.5;
        return (
          <group
            key={logo.id}
            ref={(h) => {
              holders.current[i] = h;
            }}
          >
            <Billboard>
              <mesh>
                <planeGeometry args={[PLANE_W, PLANE_W / aspect]} />
                <meshBasicMaterial
                  ref={(mm) => {
                    mats.current[i] = mm;
                  }}
                  map={tex}
                  transparent
                  opacity={0}
                  depthWrite={false}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}
