"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { band, sceneState, smooth } from "./scene-state";
import { hash, SOFT_DISC_FRAG } from "./shaders";

const ORBIT_VERT = /* glsl */ `
attribute float aRad;
attribute float aSpeed;
attribute float aPhase;
attribute float aY;
attribute float aSize;
uniform float uTime;
uniform float uSpin;
uniform float uPixelRatio;
varying vec3 vColor;
varying float vA;
void main(){
  vColor = color;
  float a = uTime * aSpeed * uSpin + aPhase;
  // radius breathes slowly — the belt feels perturbed, not stamped
  float r = aRad * (1.0 + 0.09 * sin(uTime * 0.13 * uSpin + aPhase * 3.0));
  vec3 p = vec3(
    cos(a) * r,
    aY + sin(a * 0.7 + aPhase) * 0.14 * aRad,
    sin(a) * r * 0.85
  );
  vA = 0.45 + 0.55 * sin(uTime * 1.3 * uSpin + aPhase * 7.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uPixelRatio * (150.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

type Props = {
  /** Planet radius — the belt hugs just outside it. */
  radius: number;
  /** Tint, usually the planet's atmosphere color. */
  color: string;
  /** Section band driving visibility. */
  band: "hero" | "intro" | "about" | "services" | "process" | "works" | "trust" | "industries";
  seed?: number;
};

/**
 * Orbital dust belt — particles follow kepler-ish elliptical paths around
 * their planet (inner particles faster), entirely in the vertex shader.
 * Lives inside the planet's group so it inherits approach/pass transforms.
 */
export default function OrbitDust({ radius, color, band: bandName, seed = 0 }: Props) {
  const pts = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const mobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 700,
    [],
  );

  const { geo, uniforms } = useMemo(() => {
    const count = mobile ? 70 : 130;
    const base = new THREE.Color(color);
    const pos = new Float32Array(count * 3); // placeholder — orbit is shader-computed
    const col = new Float32Array(count * 3);
    const rad = new Float32Array(count);
    const speed = new Float32Array(count);
    const phase = new Float32Array(count);
    const y = new Float32Array(count);
    const size = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const h = hash(seed * 37.7 + i * 5.9);
      const r = radius * (1.25 + h * 1.5);
      rad[i] = r;
      // nearer particles orbit faster — kepler-like falloff
      speed[i] = (0.55 + hash(seed + i * 7.3) * 0.5) / Math.sqrt(r / radius);
      phase[i] = hash(seed + i * 11.9) * Math.PI * 2;
      y[i] = (hash(seed + i * 13.1) - 0.5) * radius * 0.5;
      size[i] = 0.5 + hash(seed + i * 17.3) * 1.1;
      const dim = 0.35 + hash(seed + i * 19.9) * 0.6;
      col[i * 3] = base.r * dim;
      col[i * 3 + 1] = base.g * dim;
      col[i * 3 + 2] = base.b * dim;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aRad", new THREE.BufferAttribute(rad, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    geo.setAttribute("aY", new THREE.BufferAttribute(y, 1));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

    return {
      geo,
      uniforms: {
        uTime: { value: 0 },
        uSpin: { value: 1 },
        uPixelRatio: { value: 1 },
        uOpacity: { value: 0 },
      },
    };
  }, [radius, color, seed, mobile]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const reduced = sceneState.reducedMotion;
    const b = sceneState[bandName];
    const arrive = smooth(band(b, 0.15, 0.6));
    const fade = 1 - smooth(band(b, 0.66, 0.86));

    const u = mat.current?.uniforms;
    if (!u) return;
    u.uTime.value = t;
    u.uSpin.value = reduced ? 0.25 : 1;
    u.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.75);
    u.uOpacity.value = arrive * fade * 0.65;

    const o = pts.current;
    if (o) o.visible = u.uOpacity.value > 0.01;
  });

  return (
    <points ref={pts} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={ORBIT_VERT}
        fragmentShader={SOFT_DISC_FRAG}
        transparent
        depthWrite={false}
        vertexColors
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  );
}
