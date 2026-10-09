"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "./scene-state";
import { CURSOR_PUSH, hash, SOFT_DISC_FRAG } from "./shaders";

const STAR_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aTw;
uniform float uTime;
uniform float uPixelRatio;
uniform vec2 uCursor;
uniform float uCursorStr;
varying vec3 vColor;
varying float vA;
void main(){
  vColor = color;
  float tw = 0.72 + 0.38 * sin(uTime * aTw + aPhase);
  vA = tw;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  ${CURSOR_PUSH}
  vec4 mv = viewMatrix * wp;
  gl_PointSize = aSize * tw * uPixelRatio * (200.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

type Layer = {
  geo: THREE.BufferGeometry;
  uniforms: Record<string, THREE.IUniform>;
};

/**
 * Deep space: three shells of stars at different depths. Scroll pulls each
 * layer forward at its own rate; the pointer shifts them parallaxed and
 * gently pushes stars near the cursor; stars twinkle individually in the
 * vertex shader — all GPU-side, nothing reallocated per frame.
 */
export default function StarField() {
  const far = useRef<THREE.Points>(null);
  const mid = useRef<THREE.Points>(null);
  const near = useRef<THREE.Points>(null);
  const mats = useRef<(THREE.ShaderMaterial | null)[]>([]);

  const cursor = useRef(new THREE.Vector2(0, 0));

  const mobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 700,
    [],
  );

  const layers = useMemo<Record<"far" | "mid" | "near", Layer>>(() => {
    const white = new THREE.Color("#f4efe4");
    const blue = new THREE.Color("#7ea8ff");
    const violet = new THREE.Color("#b49aff");
    const amber = new THREE.Color("#f5a81c");
    const cyan = new THREE.Color("#7ff3ff");

    const build = (
      count: number,
      rMin: number,
      rMax: number,
      tinted: number,
      palette: THREE.Color[],
      sizeMin: number,
      sizeMax: number,
      cursorStr: number,
      opacity: number,
    ): Layer => {
      const pos = new Float32Array(count * 3);
      const col = new Float32Array(count * 3);
      const size = new Float32Array(count);
      const phase = new Float32Array(count);
      const tw = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const a = hash(i * 3.7 + rMin) * Math.PI * 2;
        const b = Math.acos(2 * hash(i * 9.1 + rMax) - 1);
        const r = rMin + hash(i * 5.3 + count) * (rMax - rMin);
        pos[i * 3] = r * Math.sin(b) * Math.cos(a);
        pos[i * 3 + 1] = r * Math.sin(b) * Math.sin(a) * 0.7;
        pos[i * 3 + 2] = r * Math.cos(b);
        const c = i % tinted === 0 ? palette[i % palette.length] : white;
        const dim = 0.55 + hash(i * 13.7) * 0.45;
        col[i * 3] = c.r * dim;
        col[i * 3 + 1] = c.g * dim;
        col[i * 3 + 2] = c.b * dim;
        size[i] = sizeMin + hash(i * 17.9) * (sizeMax - sizeMin);
        phase[i] = hash(i * 23.3) * Math.PI * 2;
        // ~70% twinkle at varied rates, the rest burn steady
        tw[i] = hash(i * 29.1) < 0.7 ? 0.4 + hash(i * 31.7) * 1.8 : 0;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
      geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
      geo.setAttribute("aTw", new THREE.BufferAttribute(tw, 1));
      return {
        geo,
        uniforms: {
          uTime: { value: 0 },
          uPixelRatio: { value: 1 },
          uCursor: { value: new THREE.Vector2(0, 0) },
          uCursorStr: { value: cursorStr },
          uOpacity: { value: opacity },
        },
      };
    };

    const k = mobile ? 0.55 : 1;
    return {
      far: build(Math.floor(2400 * k), 42, 60, 9, [blue, violet], 0.3, 0.8, 0.05, 0.9),
      mid: build(Math.floor(900 * k), 24, 40, 6, [blue, violet, amber], 0.5, 1.1, 0.16, 0.8),
      near: build(Math.floor(320 * k), 10, 22, 4, [amber, blue, cyan], 0.7, 1.5, 0.34, 0.6),
    };
  }, [mobile]);

  useFrame(({ clock, size }) => {
    const t = clock.elapsedTime;
    const p = sceneState.progress;
    const reduced = sceneState.reducedMotion;
    const drift = reduced ? 0.3 : 1;
    const sway = reduced ? 0 : 1;

    // Smoothed world-space cursor for the vertex-shader push. Touch devices
    // never write sceneState.pointer, so this stays a harmless no-op there.
    const px = sceneState.pointer.x * (reduced ? 0 : 1);
    const py = -sceneState.pointer.y * (reduced ? 0 : 1);
    const halfH = 3.2;
    const tx = px * halfH * (size.width / size.height);
    const ty = py * halfH;
    cursor.current.x += (tx - cursor.current.x) * 0.06;
    cursor.current.y += (ty - cursor.current.y) * 0.06;

    const layersArr = [
      { pts: far, pxMul: 0.12, zMul: 3, rot: 0.004, swayF: 0.05, swayA: 0.4, ph: 0 },
      { pts: mid, pxMul: 0.35, zMul: 8, rot: -0.006, swayF: 0.09, swayA: 0.6, ph: 2 },
      { pts: near, pxMul: 0.7, zMul: 16, rot: 0.01, swayF: 0.13, swayA: 1.0, ph: 4 },
    ];

    layersArr.forEach(({ pts, pxMul, zMul, rot, swayF, swayA, ph }, i) => {
      const o = pts.current;
      const u = mats.current[i]?.uniforms;
      if (!o || !u) return;
      o.position.z = p * zMul + Math.sin(t * swayF + ph) * swayA * sway;
      o.position.x = px * pxMul;
      o.position.y = py * pxMul * 0.6;
      o.rotation.z = t * rot * drift;
      u.uTime.value = reduced ? t * 0.35 : t;
      u.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.75);
      (u.uCursor.value as THREE.Vector2).copy(cursor.current);
    });
  });

  return (
    <group>
      {(["far", "mid", "near"] as const).map((key, i) => {
        const ref = key === "far" ? far : key === "mid" ? mid : near;
        const layer = layers[key];
        return (
          <points key={key} ref={ref} geometry={layer.geo} frustumCulled={false}>
            <shaderMaterial
              ref={(el) => {
                mats.current[i] = el;
              }}
              uniforms={layer.uniforms}
              vertexShader={STAR_VERT}
              fragmentShader={SOFT_DISC_FRAG}
              transparent
              depthWrite={false}
              vertexColors
              blending={key === "far" ? THREE.NormalBlending : THREE.AdditiveBlending}
              fog={false}
            />
          </points>
        );
      })}
    </group>
  );
}
