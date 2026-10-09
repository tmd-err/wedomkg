"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SNOISE } from "./shaders";
import { band, sceneState, smooth } from "./scene-state";

export type PlanetPalette = {
  /** Deep/shadow surface */
  low: string;
  /** Mid terrain */
  mid: string;
  /** Highlights / caps */
  high: string;
  /** Rim glow color */
  atmosphere: string;
};

const VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;
void main(){
  vNormal = normal;
  vObjPos = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const FRAG = /* glsl */ `
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;
uniform float uTime;
uniform float uOpacity;
uniform float uSeed;
uniform vec3 uLow;
uniform vec3 uMid;
uniform vec3 uHigh;
${SNOISE}
void main(){
  vec3 p = vObjPos + vec3(uSeed * 17.0);
  float t = uTime * 0.02;

  // banded terrain: latitude bands + turbulent continents + fine grain
  float bands = fbm(vec3(p.x, p.y * 0.35, p.z) * 1.6 + vec3(t, 0.0, t * 0.5));
  float cont  = fbm(p * 2.4 + vec3(0.0, t * 0.4, 0.0));
  float fine  = fbm(p * 7.0 - vec3(t * 0.6));

  float surf = clamp(0.5 + bands * 0.4 + cont * 0.45 + fine * 0.18, 0.0, 1.0);

  vec3 col = mix(uLow, uMid, smoothstep(0.15, 0.55, surf));
  col = mix(col, uHigh, smoothstep(0.62, 0.92, surf));

  // wrapped diffuse key light from upper-right-front
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vec3(0.6, 0.45, 0.7));
  float nl = dot(N, L) * 0.5 + 0.5;
  nl = nl * nl;
  col *= 0.14 + 1.05 * nl;

  // limb darkening gives the sphere real volume
  vec3 V = normalize(cameraPosition - vWorldPos);
  float ndv = max(dot(N, V), 0.0);
  col *= 0.35 + 0.75 * pow(ndv, 0.6);

  gl_FragColor = vec4(col, uOpacity);
}
`;

const ATMO_VERT = /* glsl */ `
varying vec3 vNormal;
void main(){
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ATMO_FRAG = /* glsl */ `
varying vec3 vNormal;
uniform vec3 uColor;
uniform float uOpacity;
void main(){
  float i = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.2);
  gl_FragColor = vec4(uColor, 1.0) * i * uOpacity;
}
`;

const RING_VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;
void main(){
  vUv = uv;
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const RING_FRAG = /* glsl */ `
varying vec2 vUv;
varying vec3 vPos;
uniform vec3 uColor;
uniform float uOpacity;
uniform float uInner;
uniform float uOuter;
void main(){
  float r = length(vPos.xy);
  float t = (r - uInner) / max(uOuter - uInner, 0.001);
  // radial bands + edge falloff
  float bands = 0.55 + 0.45 * sin(t * 34.0) * sin(t * 9.0);
  float edge = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.82, 1.0, t));
  gl_FragColor = vec4(uColor, 1.0) * bands * edge * uOpacity;
}
`;

type Props = {
  radius: number;
  palette: PlanetPalette;
  /** Section band this world belongs to — drives its own fade. */
  band: keyof Pick<
    typeof sceneState,
    "hero" | "intro" | "about" | "services" | "process" | "works" | "trust" | "industries"
  >;
  seed?: number;
  tilt?: number;
  ring?: { color: string; inner: number; outer: number } | null;
  moon?: boolean;
};

/** A procedural planet: fbm terrain, wrapped lighting, limb darkening,
 *  atmosphere shell, optional banded ring and a small orbiting moon. The
 *  planet fades itself in/out from its band's scroll progress. */
export default function Planet({
  radius,
  palette,
  band: bandName,
  seed = 1,
  tilt = 0.12,
  ring = null,
  moon = false,
}: Props) {
  const surfMat = useRef<THREE.ShaderMaterial>(null);
  const atmoMat = useRef<THREE.ShaderMaterial>(null);
  const ringMat = useRef<THREE.ShaderMaterial>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  const moonMat = useRef<THREE.MeshStandardMaterial>(null);
  const planetRef = useRef<THREE.Mesh>(null);

  const c = useMemo(
    () => ({
      low: new THREE.Color(palette.low),
      mid: new THREE.Color(palette.mid),
      high: new THREE.Color(palette.high),
      atmosphere: new THREE.Color(palette.atmosphere),
      ringColor: new THREE.Color(ring?.color ?? "#f5a81c"),
    }),
    [palette, ring],
  );

  const surfUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 0 },
      uSeed: { value: seed },
      uLow: { value: c.low },
      uMid: { value: c.mid },
      uHigh: { value: c.high },
    }),
    [c, seed],
  );
  const atmoUniforms = useMemo(
    () => ({ uColor: { value: c.atmosphere }, uOpacity: { value: 0 } }),
    [c],
  );
  const ringUniforms = useMemo(
    () => ({
      uColor: { value: c.ringColor },
      uOpacity: { value: 0 },
      uInner: { value: ring?.inner ?? 1.5 },
      uOuter: { value: ring?.outer ?? 2.3 },
    }),
    [c, ring],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const spin = sceneState.reducedMotion ? 0.25 : 1;
    const b = sceneState[bandName];
    const arrive = smooth(band(b, 0.04, 0.62));
    // Fade completes before the planet crosses the camera plane — the
    // additive atmosphere must never straddle the lens.
    const fade = 1 - smooth(band(b, 0.68, 0.88));
    const vis = Math.min(1, arrive * 1.15) * fade;
    if (surfMat.current) {
      surfMat.current.uniforms.uTime.value = t;
      surfMat.current.uniforms.uOpacity.value = vis;
    }
    if (atmoMat.current) atmoMat.current.uniforms.uOpacity.value = vis * 0.9;
    if (ringMat.current) ringMat.current.uniforms.uOpacity.value = vis * 0.75;
    if (planetRef.current) planetRef.current.rotation.y = t * 0.04 * spin;
    if (moonRef.current) {
      const a = t * 0.35 * spin;
      moonRef.current.position.set(
        Math.cos(a) * radius * 1.9,
        Math.sin(a * 0.6) * radius * 0.35,
        Math.sin(a) * radius * 1.9,
      );
      // The moon shares the planet's fade so it never floats alone.
      if (moonMat.current && surfMat.current) {
        moonMat.current.opacity = surfMat.current.uniforms.uOpacity.value;
      }
    }
  });

  return (
    <group rotation={[tilt, 0, tilt * 0.6]}>
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 64, 64]} />
        <shaderMaterial
          ref={surfMat}
          uniforms={surfUniforms}
          vertexShader={VERT}
          fragmentShader={FRAG}
          transparent
        />
      </mesh>

      {/* atmosphere rim */}
      <mesh scale={1.22}>
        <sphereGeometry args={[radius, 40, 40]} />
        <shaderMaterial
          ref={atmoMat}
          uniforms={atmoUniforms}
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {ring && (
        <mesh rotation={[1.18, 0, -0.22]}>
          <ringGeometry args={[ring.inner * radius, ring.outer * radius, 96]} />
          <shaderMaterial
            ref={ringMat}
            uniforms={ringUniforms}
            vertexShader={RING_VERT}
            fragmentShader={RING_FRAG}
            transparent
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {moon && (
        <mesh ref={moonRef}>
          <sphereGeometry args={[radius * 0.16, 24, 24]} />
          <meshStandardMaterial
            ref={moonMat}
            color="#8a8578"
            roughness={0.9}
            transparent
            opacity={0}
          />
        </mesh>
      )}
    </group>
  );
}
