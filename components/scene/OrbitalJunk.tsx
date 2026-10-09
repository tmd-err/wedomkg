"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "./scene-state";

/**
 * Incidental discoveries along the route — a moonlet circling a distant
 * anchor, a miniature ringed planet, and a tumbling probe. Small, dim,
 * always present: the universe keeps secrets between destinations.
 */
export default function OrbitalJunk() {
  const moonlet = useRef<THREE.Mesh>(null);
  const miniPlanet = useRef<THREE.Group>(null);
  const probe = useRef<THREE.Group>(null);

  useFrame(({ clock, size }) => {
    const t = clock.elapsedTime;
    const spin = sceneState.reducedMotion ? 0.3 : 1;
    const mobile = size.width < 640;

    if (moonlet.current) {
      const a = t * 0.11 * spin;
      moonlet.current.position.set(
        -11 + Math.cos(a) * 2.4,
        6.5 + Math.sin(a * 0.7) * 0.8,
        -32 + Math.sin(a) * 2.4,
      );
      moonlet.current.visible = !mobile;
    }
    if (miniPlanet.current) {
      miniPlanet.current.rotation.y = t * 0.06 * spin;
      miniPlanet.current.visible = true;
    }
    if (probe.current) {
      probe.current.rotation.x = t * 0.14 * spin;
      probe.current.rotation.z = t * 0.09 * spin;
      probe.current.position.y = 5.2 + Math.sin(t * 0.3 * spin) * 0.5;
      probe.current.visible = !mobile;
    }
  });

  return (
    <group>
      {/* distant moonlet on a slow orbit */}
      <mesh ref={moonlet}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#3a3644" roughness={0.9} />
      </mesh>

      {/* miniature ringed world, far right of the corridor */}
      <group ref={miniPlanet} position={[13, -7, -36]} rotation={[0, 0, 0.4]}>
        <mesh>
          <sphereGeometry args={[0.55, 20, 20]} />
          <meshStandardMaterial color="#2a3450" roughness={0.8} />
        </mesh>
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <ringGeometry args={[0.8, 1.15, 32]} />
          <meshBasicMaterial
            color="#8a9fd0"
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* tumbling probe — box body + solar wings */}
      <group ref={probe} position={[8.5, 5.2, -27]}>
        <mesh>
          <boxGeometry args={[0.16, 0.16, 0.24]} />
          <meshStandardMaterial color="#4a4556" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[-0.24, 0, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.02]} />
          <meshStandardMaterial
            color="#2a4a80"
            roughness={0.3}
            metalness={0.7}
            emissive="#1a3a6a"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0.24, 0, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.02]} />
          <meshStandardMaterial
            color="#2a4a80"
            roughness={0.3}
            metalness={0.7}
            emissive="#1a3a6a"
            emissiveIntensity={0.4}
          />
        </mesh>
      </group>
    </group>
  );
}
