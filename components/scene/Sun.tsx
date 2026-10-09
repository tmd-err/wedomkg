"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { band, sceneState, smooth } from "./scene-state";
import { hash, makeDotTexture, makeGlowTexture, SNOISE } from "./shaders";

const CORONA = 260;
const FAR_Z = -46; // distant beacon at journey start
const NEAR_Z = -11; // arrives close for the contact destination

const SUN_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;
uniform float uTime;
${SNOISE}
void main(){
  vNormal = normal;
  vObjPos = position;
  float n = snoise(position * 2.6 + vec3(uTime * 0.04));
  vec3 displaced = position + normal * n * 0.015;
  vec4 world = modelMatrix * vec4(displaced, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const SUN_FRAG = /* glsl */ `
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;
uniform float uTime;
uniform float uOpacity;
${SNOISE}
void main(){
  vec3 p = vObjPos;
  float t = uTime * 0.055;

  vec3 q = p * 2.1 + vec3(t, -t * 0.6, t * 0.35);
  float warp = fbm(q + fbm(q + vec3(t * 0.4)) * 1.35);
  float cells = fbm(p * 4.6 + warp * 1.8 + vec3(0.0, t * 0.5, 0.0));
  float fine = fbm(p * 9.0 - vec3(t * 0.8));

  float plasma = clamp(0.5 + warp * 0.55 + cells * 0.4 + fine * 0.16, 0.0, 1.0);
  plasma = pow(plasma, 1.15);

  vec3 deep  = vec3(0.10, 0.015, 0.0);
  vec3 dark  = vec3(0.42, 0.07, 0.005);
  vec3 mid   = vec3(0.95, 0.38, 0.02);
  vec3 hot   = vec3(1.0, 0.72, 0.22);
  vec3 white = vec3(1.0, 0.96, 0.8);

  vec3 col = mix(deep, dark, smoothstep(0.05, 0.38, plasma));
  col = mix(col, mid, smoothstep(0.38, 0.62, plasma));
  col = mix(col, hot, smoothstep(0.62, 0.86, plasma));
  col = mix(col, white, smoothstep(0.86, 0.985, plasma));

  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float ndv = max(dot(N, V), 0.0);
  float limb = pow(ndv, 0.65);
  col *= 0.30 + 0.85 * limb;
  col += vec3(0.20, 0.08, 0.0) * limb * plasma;

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
uniform float uOpacity;
uniform float uCool;
void main(){
  float i = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
  vec3 warm = mix(vec3(1.0, 0.35, 0.04), vec3(1.0, 0.75, 0.3), i);
  // settled: the rim cools toward cyan — sunrise over the destination
  vec3 cool = mix(vec3(0.12, 0.45, 0.75), vec3(0.55, 0.85, 1.0), i);
  vec3 glow = mix(warm, cool, uCool);
  gl_FragColor = vec4(glow, 1.0) * i * uOpacity;
}
`;

/**
 * The sun — the journey's destination. It hangs as a small distant ember for
 * the whole site and approaches + grows as the contact section arrives.
 */
export default function Sun() {
  const group = useRef<THREE.Group>(null);
  const sunMat = useRef<THREE.ShaderMaterial>(null);
  const atmoMat = useRef<THREE.ShaderMaterial>(null);
  const coronaGeo = useRef<THREE.BufferGeometry>(null);
  const coronaMat = useRef<THREE.PointsMaterial>(null);
  const glowMat = useRef<THREE.SpriteMaterial>(null);
  const haloMat = useRef<THREE.SpriteMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uOpacity: { value: 1 },
      uCool: { value: 0 },
    }),
    [],
  );
  const glowTex = useMemo(() => makeGlowTexture(), []);
  const dotTex = useMemo(() => makeDotTexture(), []);

  const corona = useMemo(() => {
    const pos = new Float32Array(CORONA * 3);
    const col = new Float32Array(CORONA * 3);
    const meta = new Float32Array(CORONA * 4);
    for (let i = 0; i < CORONA; i++) {
      const a = hash(i * 5.1) * Math.PI * 2;
      const lift = (hash(i * 9.7) - 0.5) * 0.55;
      const len = Math.sqrt(1 + lift * lift);
      meta[i * 4] = Math.cos(a) / len;
      meta[i * 4 + 1] = Math.sin(a) / len;
      meta[i * 4 + 2] = lift / len;
      meta[i * 4 + 3] = hash(i * 13.3);
    }
    return { pos, col, meta };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const reduced = sceneState.reducedMotion;
    // Arrival follows the contact band, not global progress — the sun
    // approaches and swells exactly while the contact section is on stage.
    const arrival = smooth(band(sceneState.contact, 0.08, 0.75));
    // Settle: near the end of the band the scene calms — plasma slows, the
    // sun sinks into a horizon composition, its rim cools toward cyan.
    const settle = smooth(band(sceneState.contact, 0.72, 1.0));
    const spin = reduced ? 0.3 : 1;

    if (sunMat.current) {
      sunMat.current.uniforms.uTime.value = t * (1 - settle * 0.4);
    }
    if (atmoMat.current) {
      atmoMat.current.uniforms.uOpacity.value = 0.5 + arrival * 0.5;
      atmoMat.current.uniforms.uCool.value = settle * 0.55;
    }

    const g = group.current;
    if (g) {
      g.position.z = THREE.MathUtils.lerp(FAR_Z, NEAR_Z, arrival);
      // sinks to a horizon arc as it arrives — the "final destination" frame
      g.position.y = THREE.MathUtils.lerp(0, -2.0, arrival);
      g.scale.setScalar(0.55 + arrival * 3.1);
      g.rotation.y = t * 0.05 * spin * (1 - settle * 0.5);
    }

    const pulse = reduced ? 0 : Math.sin(t * 1.8);
    if (glowMat.current) {
      glowMat.current.opacity = 0.18 + arrival * 0.55 + 0.08 * pulse;
    }
    if (haloMat.current) {
      haloMat.current.opacity = 0.06 + arrival * 0.32 + 0.05 * Math.max(0, -pulse);
    }
    if (coronaMat.current) {
      coronaMat.current.opacity = (0.25 + arrival * 0.75) * (1 - settle * 0.35);
    }

    const posAttr = coronaGeo.current?.getAttribute(
      "position",
    ) as THREE.BufferAttribute | undefined;
    const colAttr = coronaGeo.current?.getAttribute(
      "color",
    ) as THREE.BufferAttribute | undefined;
    if (posAttr && colAttr) {
      const pos = posAttr.array as Float32Array;
      const col = colAttr.array as Float32Array;
      const m = corona.meta;
      for (let i = 0; i < CORONA; i++) {
        const c = (t * 0.35 * spin + m[i * 4 + 3]) % 1;
        const d = 1.0 + c * c * 1.5;
        const twist = t * 0.35 * spin * (1 - c);
        const ca = Math.cos(twist);
        const sa = Math.sin(twist);
        const dx = m[i * 4] * ca - m[i * 4 + 1] * sa;
        const dy = m[i * 4] * sa + m[i * 4 + 1] * ca;
        pos[i * 3] = dx * d;
        pos[i * 3 + 1] = dy * d;
        pos[i * 3 + 2] = m[i * 4 + 2] * d;
        const fade = Math.pow(1 - c, 1.5);
        const heat = 0.55 + 0.45 * hash(i * 3.3);
        col[i * 3] = 1.0 * fade;
        col[i * 3 + 1] = (0.30 + 0.45 * heat) * fade;
        col[i * 3 + 2] = 0.05 * fade;
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    }
  });

  return (
    <group ref={group} position={[0, 0, FAR_Z]}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial
          ref={sunMat}
          uniforms={uniforms}
          vertexShader={SUN_VERT}
          fragmentShader={SUN_FRAG}
          transparent
        />
      </mesh>

      <mesh scale={1.28}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          ref={atmoMat}
          uniforms={uniforms}
          vertexShader={ATMO_VERT}
          fragmentShader={ATMO_FRAG}
          side={THREE.BackSide}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <points frustumCulled={false}>
        <bufferGeometry ref={coronaGeo}>
          <bufferAttribute
            attach="attributes-position"
            args={[corona.pos, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[corona.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={coronaMat}
          map={dotTex}
          size={0.16}
          vertexColors
          transparent
          opacity={0.25}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* inner glow + wide halo, local to the sun so they travel with it */}
      <sprite position={[0, 0, -0.5]} scale={[6, 6, 1]}>
        <spriteMaterial
          ref={glowMat}
          map={glowTex}
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <sprite position={[0, 0, -0.8]} scale={[14, 14, 1]}>
        <spriteMaterial
          ref={haloMat}
          map={glowTex}
          transparent
          opacity={0.08}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
    </group>
  );
}
