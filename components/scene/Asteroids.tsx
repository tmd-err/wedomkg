"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "./scene-state";
import { hash } from "./shaders";

const COUNT = 10;
const TINTS = ["#2a2734", "#322b42", "#2a3346", "#3a2e20"];

function makeRockGeometry(seed: number) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.multiplyScalar(0.65 + hash(seed + i * 0.53) * 0.7);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

type Rock = {
  drift: THREE.Vector3;
  rot: THREE.Vector3;
};

/**
 * Slow asteroid field — irregular low-poly rocks tumbling gently through
 * the journey corridor at varied depths. They wrap around the view box so
 * the field never empties; camera travel supplies the parallax.
 */
export default function Asteroids() {
  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const geos = useMemo(
    () => [0, 1, 2].map((s) => makeRockGeometry(s * 91 + 13)),
    [],
  );
  const rocks = useMemo<Rock[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        drift: new THREE.Vector3(
          (hash(i * 3.1 + 2) - 0.5) * 0.22,
          (hash(i * 5.3 + 4) - 0.5) * 0.14,
          (hash(i * 7.7 + 6) - 0.5) * 0.1,
        ),
        rot: new THREE.Vector3(
          (hash(i * 9.1) - 0.5) * 0.5,
          (hash(i * 11.3) - 0.5) * 0.5,
          (hash(i * 13.7) - 0.5) * 0.4,
        ),
      })),
    [],
  );
  const starts = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => [
        (hash(i * 17.1) - 0.5) * 26,
        (hash(i * 19.3) - 0.5) * 15,
        -10 - hash(i * 23.7) * 26,
      ]),
    [],
  );

  useFrame(({ size }, delta) => {
    const d = Math.min(delta, 0.05);
    const spin = sceneState.reducedMotion ? 0.25 : 1;
    const mobile = size.width < 640;
    for (let i = 0; i < COUNT; i++) {
      const m = meshes.current[i];
      if (!m) continue;
      if (mobile && i >= 5) {
        m.visible = false;
        continue;
      }
      m.visible = true;
      m.position.addScaledVector(rocks[i].drift, d * spin);
      m.rotation.x += rocks[i].rot.x * d * spin;
      m.rotation.y += rocks[i].rot.y * d * spin;
      m.rotation.z += rocks[i].rot.z * d * spin;
      // wrap the corridor so rocks never permanently leave
      if (m.position.x > 15) m.position.x = -15;
      else if (m.position.x < -15) m.position.x = 15;
      if (m.position.y > 9) m.position.y = -9;
      else if (m.position.y < -9) m.position.y = 9;
    }
  });

  return (
    <group>
      {Array.from({ length: COUNT }, (_, i) => (
        <mesh
          key={i}
          geometry={geos[i % geos.length]}
          position={starts[i] as [number, number, number]}
          scale={0.1 + hash(i * 29.3) * 0.32}
          ref={(el) => {
            meshes.current[i] = el;
          }}
        >
          <meshStandardMaterial
            color={TINTS[i % TINTS.length]}
            roughness={0.95}
            metalness={0.05}
            emissive={["#2a3a5a", "#3a2a5a", "#5a4a2a"][i % 3]}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}
