"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { sceneState, windowBand } from "./scene-state";
import { hash, makeGlowTexture } from "./shaders";
import { PROJECTS } from "@/data/projects";

const ANGLE_STEP = 0.68;
const RADIUS = 4.6;
const PLANE_W = 3.1;
const PLANE_H = PLANE_W * 0.625;

/** Portal accent per project — tinted from each brand's identity:
 *  bakery gold, clinical cyan, commerce blue, dental mint,
 *  beauty rose, construction bronze. */
const PORTAL_COLORS = [
  "#d9a54a", // Maison Kayser — warm artisan gold
  "#6ec8e8", // Ophtalmo Ryad — clinical cyan
  "#5a8ad8", // Cartway — electric commerce blue
  "#5fd4b0", // GSDental — clean mint
  "#d86aa8", // Divine Beauty — rose
  "#e8823c", // Athena — construction bronze
];

const FRAME_VERT = /* glsl */ `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAME_FRAG = /* glsl */ `
varying vec2 vUv;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uHover;
uniform float uTime;
void main(){
  vec2 d = min(vUv, 1.0 - vUv);          // distance to nearest edges
  float edge = min(d.x, d.y);
  float bw = 0.011 + uHover * 0.005;     // border width
  float line = smoothstep(bw, bw * 0.35, edge);
  float glow = exp(-edge * 22.0) * (0.35 + uHover * 0.4);
  // holographic scan sheen drifting slowly upward
  float scan = smoothstep(0.86, 1.0, 0.5 + 0.5 * sin(vUv.y * 22.0 - uTime * 1.2)) * 0.09;
  // corner ticks read brighter — portal frame hardware
  float corner = step(d.x, 0.06) * step(d.y, 0.06);
  float a = line * (0.8 + uHover * 0.5) + glow + scan + corner * 0.55;
  vec3 col = uColor * (0.75 + uHover * 0.55) + vec3(1.0) * corner * 0.2;
  gl_FragColor = vec4(col, a * uOpacity);
}
`;

/**
 * Project portals — each screenshot floats inside a luminous frame in its
 * own brand color, scattered through depth like windows into other worlds.
 * Scroll sweeps the focus; hovering a DOM row pulls that portal closer,
 * tilts it toward the pointer, and lights its frame.
 */
export default function ProjectScreens() {
  const group = useRef<THREE.Group>(null);
  const holders = useRef<(THREE.Group | null)[]>([]);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const frameMats = useRef<(THREE.ShaderMaterial | null)[]>([]);
  const glowMats = useRef<(THREE.SpriteMaterial | null)[]>([]);
  const hoverState = useRef<number[]>(PROJECTS.map(() => 0));
  const guideMat = useRef<THREE.LineBasicMaterial>(null);
  const textures = useTexture(PROJECTS.map((p) => p.image));

  useLayoutEffect(() => {
    textures.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
    });
  }, [textures]);

  // Per-portal scatter — deterministic depth/height/tilt jitter so the
  // field reads as composed space, not a stamped carousel.
  const jitter = useMemo(
    () =>
      PROJECTS.map((_, i) => ({
        dy: (hash(i * 3.1 + 7) - 0.5) * 0.9,
        dz: -hash(i * 5.7 + 3) * 1.1,
        rz: (hash(i * 7.3 + 11) - 0.5) * 0.09,
      })),
    [],
  );

  const glowTextures = useMemo(
    () =>
      PORTAL_COLORS.map((hex) => {
        const c = new THREE.Color(hex);
        return makeGlowTexture(
          `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0.55)`,
          `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0.18)`,
          `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},0)`,
        );
      }),
    [],
  );

  const frameUniforms = useMemo(
    () =>
      PROJECTS.map((_, i) => ({
        uColor: { value: new THREE.Color(PORTAL_COLORS[i]) },
        uOpacity: { value: 0 },
        uHover: { value: 0 },
        uTime: { value: 0 },
      })),
    [],
  );

  // A faint orbital guide threading the portal field.
  const guideGeo = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, RADIUS * 0.62, RADIUS * 0.62 * 0.34, 0, Math.PI * 2);
    const pts = curve.getPoints(128).map((p) => new THREE.Vector3(p.x, p.y, 0));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  useFrame(({ clock, size }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;

    const vis = windowBand(sceneState.works, 0.05, 0.18, 0.85, 0.97);
    g.visible = vis > 0.003;
    if (!g.visible) return;

    const mobile = size.width < 640;
    const tablet = !mobile && size.width < 1024;
    const xBase = mobile ? 0 : tablet ? 1.5 : 2.75;
    const yBase = mobile ? -2.35 : tablet ? -0.9 : -0.15;
    const zBase = mobile ? -5.0 : tablet ? -4.2 : -3.4;
    const scaleMul = mobile ? 0.42 : tablet ? 0.8 : 1;
    const spread = mobile ? 0.45 : 0.6;
    const reduced = sceneState.reducedMotion;

    const px = reduced ? 0 : sceneState.pointer.x;
    const py = reduced ? 0 : sceneState.pointer.y;
    const focus = sceneState.workFocus;
    const hoverIdx = sceneState.workHover;

    for (let i = 0; i < PROJECTS.length; i++) {
      const holder = holders.current[i];
      const mat = mats.current[i];
      if (!holder || !mat) continue;

      // ease the hover envelope — pull-in, tilt, and glow all ride on it
      const target = hoverIdx === i ? 1 : 0;
      const hv = hoverState.current[i] + (target - hoverState.current[i]) * 0.09;
      hoverState.current[i] = hv;

      const off = i - focus;
      const a = off * ANGLE_STEP;
      const facing = Math.max(0, Math.cos(a));
      const j = jitter[i];

      holder.position.set(
        xBase + Math.sin(a) * RADIUS * spread + j.dy * 0.4,
        yBase +
          j.dy +
          Math.abs(off) * 0.12 +
          (reduced ? 0 : Math.sin(t * 0.7 + i * 1.3) * 0.05 + hv * 0.06),
        zBase + j.dz - (1 - Math.cos(a)) * 3.0 - Math.abs(off) * 0.5 + hv * 1.1,
      );
      holder.rotation.y = -a * 0.4 + px * 0.09 * hv;
      holder.rotation.x = py * 0.05 * hv;
      holder.rotation.z = j.rz * (1 - hv * 0.7);
      holder.scale.setScalar((0.7 + facing * 0.65) * (1 + hv * 0.09) * scaleMul);

      mat.opacity = vis * Math.min(1, facing * facing * 0.95 + hv * 0.5);

      const fm = frameMats.current[i];
      if (fm) {
        fm.uniforms.uOpacity.value = vis * (0.25 + facing * 0.75);
        fm.uniforms.uHover.value = hv;
        fm.uniforms.uTime.value = reduced ? t * 0.3 : t;
      }
      const gm = glowMats.current[i];
      if (gm) {
        gm.opacity = vis * facing * (0.16 + hv * 0.35);
      }
    }

    if (guideMat.current) guideMat.current.opacity = vis * 0.16;
  });

  return (
    <group ref={group} visible={false}>
      {/* faint orbital path threading the portals */}
      <lineLoop geometry={guideGeo} position={[2.75, -0.5, -6.2]} rotation={[0.12, 0, 0]}>
        <lineBasicMaterial
          ref={guideMat}
          color="#7ea8ff"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
        />
      </lineLoop>

      {PROJECTS.map((project, i) => (
        <group
          key={project.id}
          ref={(h) => {
            holders.current[i] = h;
          }}
        >
          {/* atmospheric glow behind the portal — separates it from space */}
          <sprite position={[0, 0, -0.4]} scale={[5.4, 3.8, 1]}>
            <spriteMaterial
              ref={(mm) => {
                glowMats.current[i] = mm;
              }}
              map={glowTextures[i]}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              fog={false}
            />
          </sprite>

          {/* the world inside the portal */}
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

          {/* luminous frame — border, corner ticks, scan sheen */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[PLANE_W * 1.09, PLANE_H * 1.1]} />
            <shaderMaterial
              ref={(mm) => {
                frameMats.current[i] = mm;
              }}
              uniforms={frameUniforms[i]}
              vertexShader={FRAME_VERT}
              fragmentShader={FRAME_FRAG}
              transparent
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
