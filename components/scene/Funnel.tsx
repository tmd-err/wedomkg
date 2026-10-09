"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { band, sceneState, smooth, windowBand } from "./scene-state";

const DEPTH = 60; // tunnel length, from mouth (z=0) to throat (z=-60)
const TRAVEL = 52; // how far the tunnel slides toward the camera over the page
const RINGS = 46;
const PER_RING = 56;
const DUST = 650;
const CORONA = 260;

const ACCENT = new THREE.Color("#f5a81c");
const DIM = new THREE.Color("#5c564a");

/** Deterministic pseudo-random from an index — no Math.random in render paths. */
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

const funnelRadius = (i: number) =>
  THREE.MathUtils.lerp(4.9, 1.35, Math.pow(i / RINGS, 0.85));

function makeGlowTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, "rgba(255,150,40,0.9)");
  grad.addColorStop(0.35, "rgba(255,120,25,0.32)");
  grad.addColorStop(1, "rgba(255,100,20,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Soft white radial dot — makes points render as soft balls, not squares. */
function makeDotTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.4, "rgba(255,255,255,0.55)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * THE FUNNEL — the visitor scrolls through the depth of a marketing system:
 * a field of rotating spiral arcs (reach swirling inward) narrowing toward
 * the amber growth sun at the throat. Scroll slides the tunnel toward the
 * camera; every spiral ring turns at its own pace, so the field is a vortex,
 * not a stack of circles.
 */
export default function Funnel() {
  const group = useRef<THREE.Group>(null);
  const ringsGeo = useRef<THREE.BufferGeometry>(null);
  const ringsMat = useRef<THREE.PointsMaterial>(null);
  const dustMat = useRef<THREE.PointsMaterial>(null);
  const glowMat = useRef<THREE.SpriteMaterial>(null);
  const haloMat = useRef<THREE.SpriteMaterial>(null);

  const glowTex = useMemo(() => makeGlowTexture(), []);
  const dotTex = useMemo(() => makeDotTexture(), []);

  // Each "ring" is a 1.4–2.3 turn spiral arc. `meta` holds per-point
  // [baseAngle, radius, z, spin] so positions can be recomputed per frame
  // with each ring spinning at its own speed — a dynamic vortex.
  const rings = useMemo(() => {
    const pos = new Float32Array(RINGS * PER_RING * 3);
    const col = new Float32Array(RINGS * PER_RING * 3);
    const meta = new Float32Array(RINGS * PER_RING * 4);
    let o = 0;
    for (let i = 0; i < RINGS; i++) {
      const rBase = funnelRadius(i);
      const z = -i * (DEPTH / RINGS);
      const turns = 1.4 + hash(i * 7.3) * 0.9;
      const span = turns * Math.PI * 2;
      const curl = rBase * (0.3 + hash(i * 3.1) * 0.25); // how far the arc spirals inward
      const dir = i % 2 === 0 ? 1 : -1; // alternating spin direction
      const speed = dir * (0.05 + hash(i * 11.7) * 0.09);
      const amberRing = i % 9 === 0;
      for (let j = 0; j < PER_RING; j++) {
        const f = j / PER_RING;
        const a = f * span + i * 0.5;
        const r = rBase - f * curl + (hash(i * 97 + j) - 0.5) * 0.14;
        meta[o * 4] = a;
        meta[o * 4 + 1] = Math.max(0.2, r);
        meta[o * 4 + 2] = z + (hash(i * 31 + j * 7) - 0.5) * 0.6;
        meta[o * 4 + 3] = speed;
        const c = amberRing || j % 14 === 0 ? ACCENT : DIM;
        col[o * 3] = c.r;
        col[o * 3 + 1] = c.g;
        col[o * 3 + 2] = c.b;
        o++;
      }
    }
    return { pos, col, meta };
  }, []);

  const dust = useMemo(() => {
    const pos = new Float32Array(DUST * 3);
    const col = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
      const a = hash(i * 3.7) * Math.PI * 2;
      const z = -hash(i * 9.1) * (DEPTH + 10);
      // Dust lives inside the funnel, radius shrinking with depth.
      const depthFrac = -z / DEPTH;
      const maxR = THREE.MathUtils.lerp(4.5, 1.2, depthFrac);
      const r = hash(i * 5.3) * maxR;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = z;
      const c = i % 8 === 0 ? ACCENT : DIM;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { pos, col };
  }, []);

  useFrame(({ clock }) => {
    const g = group.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const p = sceneState.progress;
    const reduced = sceneState.reducedMotion;

    // Scroll pulls the tunnel toward the camera — you descend the funnel.
    const z = p * TRAVEL;
    g.position.z = z;
    sceneState.funnelZ = z;

    // Recompute spiral positions — every ring spins at its own speed.
    const spin = reduced ? 0.35 : 1;
    const posAttr = ringsGeo.current?.getAttribute(
      "position",
    ) as THREE.BufferAttribute | undefined;
    if (posAttr) {
      const arr = posAttr.array as Float32Array;
      const m = rings.meta;
      for (let o = 0; o < RINGS * PER_RING; o++) {
        const a = m[o * 4] + t * m[o * 4 + 3] * spin + p * 0.6;
        const r = m[o * 4 + 1] * (1 + 0.02 * Math.sin(t * 1.7 + o * 0.05));
        arr[o * 3] = Math.cos(a) * r;
        arr[o * 3 + 1] = Math.sin(a) * r;
        arr[o * 3 + 2] = m[o * 4 + 2];
      }
      posAttr.needsUpdate = true;
    }

    // Dim the field while work screens / industry type take the stage.
    const dim =
      1 -
      0.55 * windowBand(sceneState.works, 0.05, 0.15, 0.88, 0.98) -
      0.5 * windowBand(sceneState.industries, 0.1, 0.25, 0.8, 0.95);
    if (ringsMat.current) ringsMat.current.opacity = 0.9 * Math.max(0.2, dim);
    if (dustMat.current) dustMat.current.opacity = 0.5 * Math.max(0.25, dim);

    // Halo breathes with the sun.
    const arrival = smooth(band(p, 0.86, 0.99));
    const pulse = reduced ? 0 : Math.sin(t * 1.8);
    if (glowMat.current) {
      glowMat.current.opacity = 0.3 + arrival * 0.45 + 0.08 * pulse;
    }
    if (haloMat.current) {
      haloMat.current.opacity = 0.1 + arrival * 0.3 + 0.05 * Math.max(0, -pulse);
    }
  });

  return (
    <group ref={group}>
      {/* spiral ring field — positions rewritten every frame */}
      <points frustumCulled={false}>
        <bufferGeometry ref={ringsGeo}>
          <bufferAttribute attach="attributes-position" args={[rings.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[rings.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={ringsMat}
          map={dotTex}
          size={0.055}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* interior dust */}
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[dust.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[dust.col, 3]} />
        </bufferGeometry>
        <pointsMaterial
          ref={dustMat}
          map={dotTex}
          size={0.03}
          vertexColors
          transparent
          opacity={0.5}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* the sun at the throat */}
      <SolarSun dotTex={dotTex} />
      <sprite position={[0, 0, -DEPTH]} scale={[6, 6, 1]}>
        <spriteMaterial
          ref={glowMat}
          map={glowTex}
          transparent
          opacity={0.35}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <sprite position={[0, 0, -DEPTH]} scale={[14, 14, 1]}>
        <spriteMaterial
          ref={haloMat}
          map={glowTex}
          transparent
          opacity={0.1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>

      {/* service stations live inside the tunnel */}
      <ServiceStations dotTex={dotTex} />
    </group>
  );
}

/* ------- solar shaders (Ashima simplex noise) ------- */

const SNOISE = /* glsl */ `
vec3 mod289(vec3 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x - floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
float fbm(vec3 p){
  float f = 0.0, a = 0.5;
  for(int i = 0; i < 5; i++){
    f += a * snoise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 4.1);
    a *= 0.5;
  }
  return f;
}
`;

const SUN_VERT = /* glsl */ `
varying vec3 vNormal;
varying vec3 vObjPos;
varying vec3 vWorldPos;
uniform float uTime;
${SNOISE}
void main(){
  vNormal = normal;
  vObjPos = position;
  // subtle surface irregularity — the disc must not be perfectly smooth
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
${SNOISE}
void main(){
  vec3 p = vObjPos;
  float t = uTime * 0.055;

  // domain-warped turbulence — organic plasma, not flat noise
  vec3 q = p * 2.1 + vec3(t, -t * 0.6, t * 0.35);
  float warp = fbm(q + fbm(q + vec3(t * 0.4)) * 1.35);
  float cells = fbm(p * 4.6 + warp * 1.8 + vec3(0.0, t * 0.5, 0.0));
  float fine = fbm(p * 9.0 - vec3(t * 0.8));

  float plasma = clamp(0.5 + warp * 0.55 + cells * 0.4 + fine * 0.16, 0.0, 1.0);
  plasma = pow(plasma, 1.15);

  // solar palette: deep umbra -> orange -> gold -> white-hot granules
  vec3 deep  = vec3(0.10, 0.015, 0.0);
  vec3 dark  = vec3(0.42, 0.07, 0.005);
  vec3 mid   = vec3(0.95, 0.38, 0.02);
  vec3 hot   = vec3(1.0, 0.72, 0.22);
  vec3 white = vec3(1.0, 0.96, 0.8);

  vec3 col = mix(deep, dark, smoothstep(0.05, 0.38, plasma));
  col = mix(col, mid, smoothstep(0.38, 0.62, plasma));
  col = mix(col, hot, smoothstep(0.62, 0.86, plasma));
  col = mix(col, white, smoothstep(0.86, 0.985, plasma));

  // limb darkening — real stars are darker at the rim; gives volume
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  float ndv = max(dot(N, V), 0.0);
  float limb = pow(ndv, 0.65);
  col *= 0.30 + 0.85 * limb;

  // center-forward boost + faint inner heat
  col += vec3(0.20, 0.08, 0.0) * limb * plasma;

  gl_FragColor = vec4(col, 1.0);
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
void main(){
  // rim glow on a back-side shell — soft atmospheric corona
  float i = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
  vec3 glow = mix(vec3(1.0, 0.35, 0.04), vec3(1.0, 0.75, 0.3), i);
  gl_FragColor = vec4(glow, 1.0) * i;
}
`;

/**
 * THE SUN at the throat of the funnel — the literal "growth" payoff.
 * A procedural solar sphere: domain-warped plasma granulation, limb
 * darkening, rim atmosphere, and prominences licking off the surface.
 */
function SolarSun({ dotTex }: { dotTex: THREE.Texture }) {
  const group = useRef<THREE.Group>(null);
  const sun = useRef<THREE.Mesh>(null);
  const sunMat = useRef<THREE.ShaderMaterial>(null);
  const atmoMat = useRef<THREE.ShaderMaterial>(null);
  const coronaGeo = useRef<THREE.BufferGeometry>(null);
  const coronaMat = useRef<THREE.PointsMaterial>(null);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  // Prominences: sparks born on the surface that lick outward and die.
  // meta = [dirX, dirY, dirZ, phase]; directions biased to the limb plane.
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
    const p = sceneState.progress;
    const reduced = sceneState.reducedMotion;
    const arrival = smooth(band(p, 0.86, 0.99));
    const spin = reduced ? 0.3 : 1;

    if (sunMat.current) sunMat.current.uniforms.uTime.value = t;
    if (atmoMat.current) {
      atmoMat.current.uniforms.uTime.value = t;
      atmoMat.current.opacity = 0.5 + arrival * 0.5;
    }

    const g = group.current;
    if (g) {
      const s = 0.55 + arrival * 1.7;
      g.scale.setScalar(s);
      g.rotation.y = t * 0.05 * spin;
    }

    if (coronaMat.current) {
      coronaMat.current.opacity = 0.4 + arrival * 0.6;
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
        const d = 1.0 + c * c * 1.5; // hug the surface, arc outward
        const twist = t * 0.35 * spin * (1 - c);
        const ca = Math.cos(twist);
        const sa = Math.sin(twist);
        const dx = m[i * 4] * ca - m[i * 4 + 1] * sa;
        const dy = m[i * 4] * sa + m[i * 4 + 1] * ca;
        pos[i * 3] = dx * d;
        pos[i * 3 + 1] = dy * d;
        pos[i * 3 + 2] = m[i * 4 + 2] * d;
        // plasma colors: deep red-orange -> gold as they cool
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
    <group ref={group} position={[0, 0, -DEPTH]}>
      {/* the sun — procedural turbulent plasma */}
      <mesh ref={sun}>
        <sphereGeometry args={[1, 96, 96]} />
        <shaderMaterial
          ref={sunMat}
          uniforms={uniforms}
          vertexShader={SUN_VERT}
          fragmentShader={SUN_FRAG}
        />
      </mesh>

      {/* atmospheric rim glow */}
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

      {/* prominences — plasma licking off the limb */}
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
          opacity={0.45}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

const STATION_Z = [-12, -16.5, -21, -25.5];
const STATION_R = [3.4, 3.0, 2.65, 2.35];
const STATION_PTS = 170;

/**
 * Four glowing waypoints along the funnel — one per service. Each is a
 * spiral point-arc that slowly winds up as its DOM row takes focus.
 */
function ServiceStations({ dotTex }: { dotTex: THREE.Texture }) {
  const meshes = useRef<(THREE.Object3D | null)[]>([]);
  const mats = useRef<(THREE.PointsMaterial | null)[]>([]);

  // 2.2-turn spiral arc per station — a hoop that curls, not a circle.
  const spirals = useMemo(
    () =>
      STATION_R.map((rBase, i) => {
        const pos = new Float32Array(STATION_PTS * 3);
        for (let j = 0; j < STATION_PTS; j++) {
          const f = j / STATION_PTS;
          const a = f * Math.PI * 2 * 2.2 + i * 1.1;
          const r = rBase * (0.42 + 0.58 * f) + (hash(i * 41 + j) - 0.5) * 0.07;
          pos[j * 3] = Math.cos(a) * r;
          pos[j * 3 + 1] = Math.sin(a) * r;
          pos[j * 3 + 2] = (hash(i * 17 + j * 3) - 0.5) * 0.18;
        }
        return pos;
      }),
    [],
  );

  useFrame(({ camera }, delta) => {
    const lp = sceneState.services;
    const vis = windowBand(lp, 0.05, 0.14, 0.9, 0.99);
    const focus = sceneState.serviceFocus;
    const d = Math.min(delta, 0.05);

    for (let i = 0; i < STATION_Z.length; i++) {
      const mesh = meshes.current[i];
      const mat = mats.current[i];
      if (!mesh || !mat) continue;

      // Distance from the station to the camera — the tunnel slides with
      // scroll, so a station can end up right at the lens. Brighten on
      // approach, but kill it before it crosses the camera plane or it
      // becomes a hard streak across the screen.
      const worldZ = STATION_Z[i] + sceneState.funnelZ;
      const dist = camera.position.z - worldZ;
      const nearCam = 1 - smooth(band(dist, 5.2, 2.4));
      const ignite = Math.exp(-Math.abs(focus - i) * 1.6); // DOM row focus

      // Winding spirals — focused stations spin faster.
      mesh.rotation.z += d * (0.12 + ignite * 0.7);
      const s = 1 + ignite * 0.12;
      mesh.scale.setScalar(s);
      mat.opacity = vis * nearCam * (0.1 + ignite * 0.85);
    }
  });

  return (
    <>
      {STATION_Z.map((z, i) => (
        <points
          key={i}
          position={[0, 0, z]}
          ref={(m) => {
            meshes.current[i] = m;
          }}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[spirals[i], 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={(mm) => {
              mats.current[i] = mm;
            }}
            color={ACCENT}
            map={dotTex}
            size={0.07}
            transparent
            opacity={0}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      ))}
    </>
  );
}
