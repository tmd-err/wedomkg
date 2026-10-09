"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "./scene-state";

const look = new THREE.Vector3();
const lookTarget = new THREE.Vector3();
const posTarget = new THREE.Vector3();

/**
 * The camera drifts forward the whole journey while the planets sail toward
 * it (Destinations drives them per band). It subtly tilts its gaze toward
 * whichever world owns the stage; the pointer adds a gentle parallax sway.
 */
export default function Rig() {
  const lookCur = useRef(new THREE.Vector3(0, 0, -8));

  useFrame(({ camera }, delta) => {
    const p = sceneState.progress;
    const reduced = sceneState.reducedMotion;

    const px = sceneState.pointer.x * (reduced ? 0 : 0.35);
    const py = -sceneState.pointer.y * (reduced ? 0 : 0.2);

    // Forward travel + a slow vertical sway that crests mid-journey —
    // the camera breathes between destinations, not just dollies.
    posTarget.set(
      px,
      0.15 + py + Math.sin(p * Math.PI * 2.2) * 0.35,
      8.5 - p * 1.4,
    );

    const d = Math.min(delta, 0.05);
    camera.position.x = THREE.MathUtils.damp(camera.position.x, posTarget.x, 5, d);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, posTarget.y, 5, d);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, posTarget.z, 5, d);

    // Gaze blends between the deep-space axis and the active planet —
    // keeps text-centered compositions while the world owns the periphery.
    const f = sceneState.focus;
    lookTarget.set(
      f.x * f.w * 0.45 + px * 0.5,
      f.y * f.w * 0.4 + py * 0.35 - p * 0.1,
      -8 + f.z * f.w * 0.35,
    );
    lookCur.current.lerp(lookTarget, 1 - Math.exp(-4 * d));
    look.copy(lookCur.current);
    camera.lookAt(look);
  });

  return null;
}
