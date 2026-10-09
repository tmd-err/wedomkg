"use client";

import { useLayoutEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { sceneState, windowBand } from "./scene-state";
import { PROJECTS } from "@/data/projects";

const ANGLE_STEP = 0.68;
const RADIUS = 4.6;
const PLANE_W = 3.1;
const PLANE_H = PLANE_W * 0.625;

/**
 * Project screenshots on a rotating carousel inside the scene. The DOM
 * work rows drive sceneState.workFocus — the focused screen swings to the
 * front while neighbours recede on the arc and dim by facing angle.
 */
export default function ProjectScreens() {
  const group = useRef<THREE.Group>(null);
  const holders = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const textures = useTexture(PROJECTS.map((p) => p.image));

  useLayoutEffect(() => {
    textures.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
    });
  }, [textures]);

  useFrame(({ clock, size }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;

    const vis = windowBand(sceneState.works, 0.05, 0.18, 0.85, 0.97);
    g.visible = vis > 0.003;
    if (!g.visible) return;

    // Narrow viewports can't fit text + a right-side carousel — center the
    // focused screen in the lower half, under the row's copy.
    const mobile = size.width < 640;
    const tablet = !mobile && size.width < 1024;
    const xBase = mobile ? 0 : tablet ? 1.5 : 2.75;
    const yBase = mobile ? -2.35 : tablet ? -0.9 : -0.15;
    const zBase = mobile ? -5.0 : tablet ? -4.2 : -3.4;
    const scaleMul = mobile ? 0.42 : tablet ? 0.8 : 1;
    const spread = mobile ? 0.45 : 0.6;

    const focus = sceneState.workFocus;
    for (let i = 0; i < PROJECTS.length; i++) {
      const holder = holders.current[i];
      const mat = mats.current[i];
      if (!holder || !mat) continue;

      const off = i - focus;
      const a = off * ANGLE_STEP;
      // Focused screen parks in the right third beside the row's text;
      // the rest of the arc fans out behind it.
      holder.position.set(
        xBase + Math.sin(a) * RADIUS * spread,
        yBase +
          Math.abs(off) * 0.12 +
          (sceneState.reducedMotion ? 0 : Math.sin(t * 0.7 + i * 1.3) * 0.05),
        zBase - (1 - Math.cos(a)) * 3.0 - Math.abs(off) * 0.5,
      );
      holder.rotation.y = -a * 0.4;
      const facing = Math.max(0, Math.cos(a));
      // Focused card reads ~1.35x, wings shrink to ~0.7x — one hero per row.
      holder.scale.setScalar((0.7 + facing * 0.65) * scaleMul);

      // Front card dominant, neighbours fade fast — no wall of screens.
      mat.opacity = vis * facing * facing * 0.95;
    }
  });

  return (
    <group ref={group} visible={false}>
      {PROJECTS.map((project, i) => (
        <group
          key={project.id}
          ref={(h) => {
            holders.current[i] = h;
          }}
        >
          <mesh>
            <planeGeometry args={[PLANE_W, PLANE_H]} />
            <meshBasicMaterial
              ref={(mm) => {
                mats.current[i] = mm;
              }}
              map={textures[i]}
              transparent
              opacity={0}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
