"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { band, sceneState, smooth } from "./scene-state";

const look = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const posTarget = new THREE.Vector3();

type Key = { p: number; pos: [number, number, number]; fov: number };

/**
 * The flight plan. Each key swings the camera toward the side of the
 * arriving world (planets stage left/right alternately), dips and rises
 * on the transit legs, and gently widens the lens while moving —
 * tightening again as each destination settles.
 */
const ROUTE: Key[] = [
  { p: 0.0, pos: [0, 0.15, 8.5], fov: 44 }, // hero — ringed giant right
  { p: 0.07, pos: [-0.85, 0.55, 8.0], fov: 46 }, // intro world, left
  { p: 0.17, pos: [0.85, 0.1, 7.5], fov: 45 }, // about world, right
  { p: 0.28, pos: [-0.8, -0.4, 7.0], fov: 47 }, // services system, left-low
  { p: 0.4, pos: [0.8, -0.55, 6.6], fov: 45 }, // process world, right-low
  { p: 0.53, pos: [-1.05, 0.6, 6.1], fov: 48 }, // works — wide on the portal field
  { p: 0.66, pos: [0.5, -0.15, 5.8], fov: 44 }, // trust harbor, center
  { p: 0.78, pos: [-0.6, 0.55, 5.5], fov: 46 }, // industries, left
  { p: 0.89, pos: [0, 0.35, 5.1], fov: 44 }, // center for final approach
  { p: 1.0, pos: [0, 0.6, 4.55], fov: 46 }, // settle on the sun horizon
];

function sampleRoute(p: number, out: THREE.Vector3): number {
  let i = 0;
  while (i < ROUTE.length - 2 && p > ROUTE[i + 1].p) i++;
  const a = ROUTE[i];
  const b = ROUTE[i + 1];
  const t = smooth(Math.min(1, Math.max(0, (p - a.p) / (b.p - a.p))));
  out.set(
    THREE.MathUtils.lerp(a.pos[0], b.pos[0], t),
    THREE.MathUtils.lerp(a.pos[1], b.pos[1], t),
    THREE.MathUtils.lerp(a.pos[2], b.pos[2], t),
  );
  return THREE.MathUtils.lerp(a.fov, b.fov, t);
}

/**
 * The camera flies one continuous route through the universe — banking into
 * turns, widening its lens in transit, settling at each destination.
 * The planets themselves are staged by Destinations; the pointer adds a
 * gentle parallax sway on top of the path.
 */
export default function Rig() {
  const lookCur = useRef(new THREE.Vector3(0, 0, -8));
  const roll = useRef(0);
  const prevX = useRef(0);
  const fov = useRef(44);

  useFrame(({ camera }, delta) => {
    const p = sceneState.progress;
    const reduced = sceneState.reducedMotion;

    const px = sceneState.pointer.x * (reduced ? 0 : 0.35);
    const py = -sceneState.pointer.y * (reduced ? 0 : 0.2);

    const settle = smooth(band(sceneState.contact, 0.68, 1.0));

    // Designed route — lateral amplitude shrinks under reduced motion.
    const amp = reduced ? 0.35 : 1;
    const routeFov = sampleRoute(p, posTarget);
    posTarget.x = posTarget.x * amp + px;
    posTarget.y = posTarget.y * amp + 0.15 + py + (reduced ? 0 : Math.sin(p * Math.PI * 2.2) * 0.12 * (1 - settle));

    const d = Math.min(delta, 0.05);
    const pc = camera as THREE.PerspectiveCamera;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, posTarget.x, 5, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, posTarget.y, 5, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, posTarget.z, 5, d);

    // Lens breathes with the route — wider while traveling, tighter at rest.
    fov.current = THREE.MathUtils.damp(fov.current, routeFov, 3, d);
    if (Math.abs(pc.fov - fov.current) > 0.01) {
      pc.fov = fov.current;
      pc.updateProjectionMatrix();
    }

    // Gaze blends between the deep-space axis and the active planet —
    // keeps text-centered compositions while the world owns the periphery.
    const f = sceneState.focus;
    lookTarget.set(
      f.x * f.w * 0.45 * (1 - settle) + px * 0.5,
      f.y * f.w * 0.4 * (1 - settle) + py * 0.35 - p * 0.1 - settle * 1.0,
      -8 + f.z * f.w * 0.35 * (1 - settle),
    );
    lookCur.current.lerp(lookTarget, 1 - Math.exp(-4 * d));
    look.copy(lookCur.current);
    camera.lookAt(look);

    // Bank into lateral turns — roll follows actual camera velocity.
    const vx = d > 0 ? (camera.position.x - prevX.current) / d : 0;
    prevX.current = camera.position.x;
    const bank = THREE.MathUtils.clamp(-vx * 0.05, -0.07, 0.07) * amp;
    roll.current = THREE.MathUtils.damp(roll.current, bank, 6, d);
    camera.rotateZ(roll.current);
  });

  return null;
}
