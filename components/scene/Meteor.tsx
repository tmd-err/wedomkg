"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "./scene-state";
import { hash, makeGlowTexture, makeStreakTexture } from "./shaders";

const POOL = 7; // 5 meteors + 2 comets
const METEOR_TINTS = ["#cfe8ff", "#9fd0ff", "#e8f4ff", "#ffd9a0", "#b8a8ff"];
const COMET_TINTS = ["#6ad0ff", "#a78bfa"];

type Slot = {
  active: boolean;
  comet: boolean;
  nextAt: number;
  life: number;
  dur: number;
  vel: THREE.Vector3;
  wobble: number;
  bright: number;
};

function makeRockGeometry(seed: number) {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.multiplyScalar(0.72 + hash(seed + i * 0.37) * 0.56);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

const _cam = new THREE.Vector3();
const _dir = new THREE.Vector3();
const X_AXIS = new THREE.Vector3(1, 0, 0);

/**
 * Pooled meteorites and comets — spawned off-camera into the view corridor,
 * flown diagonally with gradient trails and rocky heads, then recycled with
 * fresh random parameters. Comets are rarer, slower, brighter and curved.
 * Rare "spectacular" meteors pass bigger and whiter.
 */
export default function Meteor() {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const rocks = useRef<(THREE.Mesh | null)[]>([]);
  const heads = useRef<(THREE.Sprite | null)[]>([]);
  const headMats = useRef<(THREE.SpriteMaterial | null)[]>([]);
  const trails = useRef<(THREE.Mesh | null)[]>([]);
  const trailMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);

  const slots = useRef<Slot[]>(
    Array.from({ length: POOL }, (_, i) => ({
      active: false,
      comet: i >= 5,
      nextAt: 2 + hash(i * 3.7) * (i >= 5 ? 30 : 10),
      life: 0,
      dur: 1,
      vel: new THREE.Vector3(),
      wobble: 0,
      bright: 1,
    })),
  );

  const rockGeo = useMemo(() => makeRockGeometry(7), []);
  const glowTex = useMemo(() => makeGlowTexture("rgba(255,255,255,0.95)"), []);
  const streakTex = useMemo(() => makeStreakTexture(), []);

  useFrame(({ clock, camera, size }, delta) => {
    const t = clock.elapsedTime;
    const reduced = sceneState.reducedMotion;
    const calm = 1 + sceneState.contact * 2.5; // the finale stays quiet
    const mobile = size.width < 640;
    const d = Math.min(delta, 0.05);
    camera.getWorldPosition(_cam);

    for (let i = 0; i < POOL; i++) {
      const slot = slots.current[i];
      const g = groups.current[i];
      if (!g) continue;
      // mobile: run a smaller pool
      if (mobile && i >= 4) {
        g.visible = false;
        continue;
      }

      if (!slot.active) {
        if (reduced || t < slot.nextAt) {
          g.visible = false;
          continue;
        }
        // spawn at a view-corridor edge, relative to the camera
        const comet = slot.comet;
        const depth = comet ? 8 + hash(t + i) * 22 : 3 + hash(t + i) * 26;
        const edge = hash(t * 3 + i * 11);
        const sx =
          edge < 0.4 ? -13 : edge < 0.8 ? 13 : (hash(t + 5) - 0.5) * 22;
        const sy =
          edge < 0.8 ? (hash(t + 7) - 0.5) * 14 : 9 + hash(t + 9) * 3;
        g.position.set(_cam.x + sx, _cam.y + sy, _cam.z - depth);

        // diagonal velocity across the view
        const speed = comet
          ? 2.2 + hash(t + 13) * 1.4
          : 6.5 + hash(t + 13) * 6.5;
        const tx = sx > 0 ? -1 : sx < 0 ? 1 : hash(t + 17) > 0.5 ? 1 : -1;
        slot.vel
          .set(tx * speed, (hash(t + 19) - 0.5) * speed * 0.8, (hash(t + 23) - 0.5) * 2)
          .normalize()
          .multiplyScalar(speed);

        const spectacular = !comet && hash(t + i * 31) > 0.92;
        slot.bright = spectacular ? 1.9 : 1;
        slot.wobble = comet ? 0.5 + hash(t + 29) * 0.8 : 0;
        slot.dur = 30 / speed + 1.5;
        slot.life = 0;
        slot.active = true;
        g.visible = true;

        const tint = comet
          ? COMET_TINTS[i % COMET_TINTS.length]
          : spectacular
            ? "#ffffff"
            : METEOR_TINTS[Math.floor(hash(t + i) * METEOR_TINTS.length)];
        const rock = rocks.current[i];
        if (rock) {
          rock.scale.setScalar((comet ? 0.3 : 0.09 + hash(t + 3) * 0.1) * slot.bright);
        }
        const hm = headMats.current[i];
        if (hm) {
          hm.color.set(tint);
          const hs = heads.current[i];
          if (hs) hs.scale.setScalar((comet ? 1.9 : 0.85) * slot.bright);
        }
        const tm = trailMats.current[i];
        if (tm) tm.color.set(tint);
      }

      slot.life += d;
      const lt = slot.life / slot.dur;
      if (lt >= 1) {
        slot.active = false;
        g.visible = false;
        slot.nextAt =
          t + (slot.comet ? 14 + hash(t + i) * 22 : 2 + hash(t + i) * 9) * calm;
        continue;
      }

      g.position.addScaledVector(slot.vel, d);
      if (slot.wobble) {
        g.position.y += Math.sin(lt * Math.PI * 2.6) * slot.wobble * d * 2.4;
      }

      const rock = rocks.current[i];
      if (rock) {
        rock.rotation.x += d * 1.1;
        rock.rotation.y += d * 0.8;
      }

      // envelope: fade the head/trail in and out across the crossing
      const env = Math.min(1, lt * 6, (1 - lt) * 6) * slot.bright;
      const hm = headMats.current[i];
      if (hm) hm.opacity = Math.min(1, env);
      const trail = trails.current[i];
      const tm = trailMats.current[i];
      if (trail && tm) {
        const len = (slot.comet ? 8 : 4.5) * slot.bright;
        trail.position.set(-len / 2, 0, 0);
        trail.scale.set(len, slot.comet ? 0.7 : 0.34, 1);
        tm.opacity = Math.min(1, env * 0.95);
        // orient the trail along velocity: group +x points along -vel
        g.quaternion.setFromUnitVectors(
          X_AXIS,
          _dir.copy(slot.vel).negate().normalize(),
        );
      }
    }
  });

  return (
    <group>
      {Array.from({ length: POOL }, (_, i) => (
        <group
          key={i}
          visible={false}
          ref={(el) => {
            groups.current[i] = el;
          }}
        >
          {/* rocky head */}
          <mesh
            geometry={rockGeo}
            ref={(el) => {
              rocks.current[i] = el;
            }}
          >
            <meshStandardMaterial color="#2a2430" roughness={0.9} metalness={0.1} />
          </mesh>
          {/* luminous head glow */}
          <sprite
            ref={(el) => {
              heads.current[i] = el;
            }}
          >
            <spriteMaterial
              ref={(el) => {
                headMats.current[i] = el;
              }}
              map={glowTex}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              fog={false}
            />
          </sprite>
          {/* gradient trail — local +x points along -velocity */}
          <mesh
            ref={(el) => {
              trails.current[i] = el;
            }}
          >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              ref={(el) => {
                trailMats.current[i] = el;
              }}
              map={streakTex}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
              fog={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
