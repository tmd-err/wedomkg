"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "./scene-state";

const look = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const posTarget = new THREE.Vector3();

/**
 * The camera barely travels — the funnel comes to it. Scroll pulls the world
 * toward the lens; the pointer adds a gentle parallax sway.
 */
export default function Rig() {
  const lookCur = useRef(new THREE.Vector3(0, 0, -8));

  useFrame(({ camera }, delta) => {
    const p = sceneState.progress;
    const reduced = sceneState.reducedMotion;

    const px = sceneState.pointer.x * (reduced ? 0 : 0.3);
    const py = -sceneState.pointer.y * (reduced ? 0 : 0.18);

    posTarget.set(
      px,
      0.15 + py,
      8.5 - p * 0.9, // slight push-in over the whole journey
    );

    const d = Math.min(delta, 0.05);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, posTarget.x, 5, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, posTarget.y, 5, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, posTarget.z, 5, d);

    // Gaze down the funnel throat — where the core waits.
    lookTarget.set(px * 0.5, py * 0.35 - p * 0.15, -8);
    lookCur.current.lerp(lookTarget, 1 - Math.exp(-6 * d));
    look.copy(lookCur.current);
    camera.lookAt(look);
  });

  return null;
}
