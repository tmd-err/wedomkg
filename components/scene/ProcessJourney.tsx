"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { band, sceneState, smooth, windowBand } from "./scene-state";
import { SOFT_DISC_FRAG, hash, makeDotTexture, makeGlowTexture } from "./shaders";

const GOLD = "#f5a81c";
const NEBULA_TINTS = [
  ["rgba(139,92,246,0.55)", "rgba(90,60,200,0.2)", "rgba(60,40,160,0)"],
  ["rgba(90,138,216,0.5)", "rgba(60,90,200,0.18)", "rgba(40,60,160,0)"],
  ["rgba(216,72,150,0.4)", "rgba(160,50,120,0.15)", "rgba(120,40,100,0)"],
];

/* Particles converge on the origin — information gathering toward signal. */
const INFLOW_VERT = /* glsl */ `
attribute vec3 aPos;
attribute float aPhase;
attribute float aSize;
uniform float uTime;
uniform vec3 uColor;
varying float vA;
varying vec3 vColor;
void main(){
  float k = fract(uTime * 0.055 + aPhase);
  vec3 p = aPos * (1.0 - k);
  p.xz += vec2(-aPos.z, aPos.x) * 0.18 * k; // slight curl inward
  vA = smoothstep(0.0, 0.12, k) * (0.3 + 0.7 * (1.0 - k));
  vColor = uColor;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * 200.0 / -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

/* Spiral galaxy — differential rotation, gold core → violet → blue rim. */
const GALAXY_VERT = /* glsl */ `
attribute float aRad;
attribute float aAng;
attribute vec3 aJit;
attribute float aSize;
attribute vec3 aColor;
uniform float uTime;
uniform float uVis;
uniform float uSpread;
varying vec3 vC;
varying float vA;
void main(){
  float ang = aAng + aRad * 1.75 + uTime * (0.4 / (aRad + 0.5));
  vec3 p = vec3(cos(ang) * aRad, aJit.y * 0.5, sin(ang) * aRad);
  p.xz += aJit.xz * aRad * 0.15 * uSpread;
  vC = aColor;
  vA = uVis;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * 170.0 / -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const GALAXY_FRAG = /* glsl */ `
varying vec3 vC;
varying float vA;
void main(){
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.08, d) * vA;
  gl_FragColor = vec4(vC, a);
}
`;

const PATHS = [
  [[0, 0, 0], [-2.5, 1.2, -2.5], [-5.5, 2.6, -6], [-7.5, 3.4, -9]],
  [[0, 0, 0], [2.2, 1.6, -2], [4.8, 2.8, -5], [6.8, 3.8, -8.5]],
  [[0, 0, 0], [1.4, -1.4, -2.4], [2.6, -3.0, -5.5], [3.4, -4.4, -8]],
  [[0, 0, 0], [-1.8, -1.0, -2], [-4.4, -2.2, -5], [-6.4, -3.2, -8]],
];

/**
 * The golden thread: one signal evolving through four cosmic states —
 * signal (radar + inflow) → ignition (nebula + arcs) → acceleration
 * (branching energy paths) → expansion (living spiral galaxy with a
 * returning pulse — growth as a loop). Driven by processFocus 0..3.
 */
export default function ProcessJourney() {
  const root = useRef<THREE.Group>(null);
  const core = useRef<THREE.Sprite>(null);
  const coreMat = useRef<THREE.SpriteMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  const ringMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const orbitMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);
  const nebMats = useRef<(THREE.SpriteMaterial | null)[]>([]);
  const nebs = useRef<(THREE.Sprite | null)[]>([]);
  const arcs = useRef<(THREE.Mesh | null)[]>([]);
  const arcMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const nodeMats = useRef<(THREE.SpriteMaterial | null)[]>([]);
  const inflowMat = useRef<THREE.ShaderMaterial>(null);
  const galaxyMat = useRef<THREE.ShaderMaterial>(null);
  const trailPts = useRef<THREE.Points>(null);
  const pulse = useRef<THREE.Sprite>(null);
  const pulseMat = useRef<THREE.SpriteMaterial>(null);
  const newborn = useRef<THREE.Sprite>(null);
  const newbornMat = useRef<THREE.SpriteMaterial>(null);
  const galaxyGroup = useRef<THREE.Group>(null);

  const dotTex = useMemo(() => makeDotTexture(), []);
  const glowTex = useMemo(
    () => makeGlowTexture("rgba(255,200,90,0.95)", "rgba(245,168,28,0.4)", "rgba(245,168,28,0)"),
    [],
  );
  const nebTex = useMemo(
    () => NEBULA_TINTS.map(([i, m, o]) => makeGlowTexture(i, m, o)),
    [],
  );

  // inflow particle spawn cloud
  const inflowGeo = useMemo(() => {
    const n = 160;
    const pos = new Float32Array(n * 3);
    const spawn = new Float32Array(n * 3);
    const phase = new Float32Array(n);
    const sizes = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const r = 1.5 + hash(i * 3.1) * 3.2;
      const th = hash(i * 5.3) * Math.PI * 2;
      const ph = (hash(i * 7.7) - 0.5) * Math.PI * 0.8;
      spawn[i * 3] = Math.cos(th) * Math.cos(ph) * r;
      spawn[i * 3 + 1] = Math.sin(ph) * r * 0.6;
      spawn[i * 3 + 2] = Math.sin(th) * Math.cos(ph) * r;
      phase[i] = hash(i * 9.3);
      sizes[i] = 0.22 + hash(i * 11.7) * 0.55;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aPos", new THREE.BufferAttribute(spawn, 3));
    g.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    return g;
  }, []);

  // spiral galaxy — three arms, layered radius, gold→violet→blue
  const galaxyGeo = useMemo(() => {
    const n = 1500;
    const rad = new Float32Array(n);
    const ang = new Float32Array(n);
    const jit = new Float32Array(n * 3);
    const sizes = new Float32Array(n);
    const cols = new Float32Array(n * 3);
    const cCore = new THREE.Color("#ffd27a");
    const cMid = new THREE.Color("#a78bfa");
    const cEdge = new THREE.Color("#4a6fd8");
    const tmp = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const r = Math.pow(hash(i * 1.31 + 0.7), 1.6) * 5.4 + 0.15;
      rad[i] = r;
      ang[i] = (i % 3) * ((Math.PI * 2) / 3);
      jit[i * 3] = (hash(i * 3.7) - 0.5);
      jit[i * 3 + 1] = (hash(i * 5.1) - 0.5) * (0.6 - r * 0.08);
      jit[i * 3 + 2] = (hash(i * 7.9) - 0.5);
      sizes[i] = (0.3 + hash(i * 9.9) * 1.2) * (0.55 + r * 0.11);
      const k = r / 5.4;
      if (k < 0.35) tmp.lerpColors(cCore, cMid, k / 0.35);
      else tmp.lerpColors(cMid, cEdge, (k - 0.35) / 0.65);
      cols[i * 3] = tmp.r;
      cols[i * 3 + 1] = tmp.g;
      cols[i * 3 + 2] = tmp.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("aRad", new THREE.BufferAttribute(rad, 1));
    g.setAttribute("aAng", new THREE.BufferAttribute(ang, 1));
    g.setAttribute("aJit", new THREE.BufferAttribute(jit, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    g.setAttribute("aColor", new THREE.BufferAttribute(cols, 3));
    return g;
  }, []);

  const curves = useMemo(
    () => PATHS.map((pts) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...(p as [number, number, number]))))),
    [],
  );

  // flowing trail particles along the four paths
  const TRAIL_N = 140;
  const trailGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(TRAIL_N * 3), 3));
    return g;
  }, []);
  const trailMeta = useMemo(
    () =>
      Array.from({ length: TRAIL_N }, (_, i) => ({
        path: i % PATHS.length,
        phase: hash(i * 3.3),
        speed: 0.09 + hash(i * 5.7) * 0.05,
      })),
    [],
  );

  const orbitGeos = useMemo(
    () =>
      [1.15, 1.6, 2.1].map((r) => {
        const pts = new THREE.EllipseCurve(0, 0, r, r * 0.62).getPoints(96);
        return new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, 0)));
      }),
    [],
  );

  const arcGeos = useMemo(
    () => [1.0, 1.35, 1.7].map((r, i) => new THREE.TorusGeometry(r, 0.012, 6, 80, Math.PI * (0.9 + i * 0.25))),
    [],
  );

  const trailLines = useMemo(
    () =>
      curves.map((c) => {
        const geo = new THREE.BufferGeometry().setFromPoints(c.getPoints(80));
        return new THREE.Line(
          geo,
          new THREE.LineBasicMaterial({
            color: "#f5b23c",
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
          }),
        );
      }),
    [curves],
  );

  const nodePositions = useMemo(
    () => curves.flatMap((c) => [c.getPoint(0.55), c.getPoint(1)]),
    [curves],
  );

  useFrame(({ clock, size }) => {
    const g = root.current;
    if (!g) return;
    const t = clock.elapsedTime;
    const p = sceneState.process;
    const f = sceneState.processFocus;
    const reduced = sceneState.reducedMotion;
    const sp = reduced ? 0.3 : 1;

    const vis = windowBand(p, 0.03, 0.14, 0.86, 0.97);
    g.visible = vis > 0.003;
    if (!g.visible) return;

    const mobile = size.width < 640;
    g.scale.setScalar(mobile ? 0.6 : 1);

    // Stage weights from continuous row focus
    const s1w = 1 - smooth(band(f, 0.3, 1.05)); // signal era
    const ignite = smooth(band(f, 0.5, 1.25)); // star born
    const accel = smooth(band(f, 1.45, 2.15)); // energy travels
    const galw = smooth(band(f, 2.25, 3.0)); // galaxy expansion

    // entity drifts to the side opposite the active text row
    const side = Math.round(Math.max(0, Math.min(3, f))) % 2 === 0 ? -1.7 : 1.7;
    const tx = mobile ? 0 : side;
    g.position.x += (tx - g.position.x) * 0.04;
    g.position.y += (0.4 - g.position.y) * 0.05;

    // pointer parallax on the whole formation
    const px = reduced ? 0 : sceneState.pointer.x;
    const py = reduced ? 0 : sceneState.pointer.y;
    g.rotation.y = px * 0.06;
    g.rotation.x = py * 0.04;

    // --- the golden signal → star → galaxy core ---
    const beat = 1 + Math.sin(t * 2.2 * sp) * 0.06;
    const coreScale = (0.55 + ignite * 1.5 + galw * 0.7) * beat;
    if (core.current) core.current.scale.setScalar(coreScale);
    if (coreMat.current) coreMat.current.opacity = vis * (0.65 + ignite * 0.35);
    if (light.current) light.current.intensity = vis * (1.5 + ignite * 5 + accel * 2);

    // --- stage 1: radar rings + inflow + orbit lines ---
    const s1 = s1w * vis;
    rings.current.forEach((r, i) => {
      if (!r) return;
      const k = (t * 0.16 * sp + i / 3) % 1;
      r.scale.setScalar(0.4 + k * 3.6);
      const rm = ringMats.current[i];
      if (rm) rm.opacity = (1 - k) * 0.28 * s1;
    });
    orbitMats.current.forEach((m) => {
      if (m) m.opacity = 0.16 * vis * (s1w + ignite * 0.6);
    });
    if (inflowMat.current) {
      inflowMat.current.uniforms.uTime.value = t * sp;
      inflowMat.current.uniforms.uOpacity.value =
        vis * (1 - accel * 0.6) * (0.5 + ignite * 0.5);
    }

    // --- stage 2: nebula wisps + energy arcs ---
    nebs.current.forEach((s, i) => {
      if (!s) return;
      s.material.rotation = t * (0.03 + i * 0.012) * (i % 2 ? -1 : 1) * sp;
      s.scale.setScalar(3.2 + i * 1.4);
      const nm = nebMats.current[i];
      if (nm) nm.opacity = vis * ignite * 0.32;
    });
    arcs.current.forEach((a, i) => {
      if (!a) return;
      a.rotation.z = t * (0.14 + i * 0.05) * (i % 2 ? -1 : 1) * sp;
      const am = arcMats.current[i];
      if (am) am.opacity = vis * ignite * (1 - galw * 0.4) * 0.5;
    });

    // --- stage 3: branching trails + nodes ---
    trailLines.forEach((l) => {
      (l.material as THREE.LineBasicMaterial).opacity =
        vis * accel * (1 - galw * 0.5) * 0.3;
    });
    nodeMats.current.forEach((m, i) => {
      if (!m) return;
      const seq = Math.max(0, 1 - Math.abs(accel * 1.4 - i / (nodeMats.current.length - 1)));
      m.opacity = vis * accel * seq * (0.55 + 0.45 * Math.sin(t * 1.6 * sp + i));
    });
    if (trailPts.current) {
      const arr = trailPts.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < TRAIL_N; i++) {
        const m = trailMeta[i];
        const k = (m.phase + t * m.speed * sp) % 1;
        const pt = curves[m.path].getPoint(k);
        arr[i * 3] = pt.x;
        arr[i * 3 + 1] = pt.y;
        arr[i * 3 + 2] = pt.z;
      }
      trailPts.current.geometry.attributes.position.needsUpdate = true;
      const tm = trailPts.current.material as THREE.PointsMaterial;
      tm.opacity = vis * accel * (1 - galw * 0.4) * 0.85;
    }

    // --- stage 4: the galaxy + returning pulse (the loop) ---
    if (galaxyMat.current) {
      galaxyMat.current.uniforms.uTime.value = t * sp;
      galaxyMat.current.uniforms.uVis.value = vis * galw;
      galaxyMat.current.uniforms.uSpread.value = 0.5 + galw * 0.6;
    }
    if (pulse.current && pulseMat.current) {
      const k = (t * 0.07 * sp) % 1;
      const r = 0.4 + k * 4.6; // travels outward along the spiral
      const ang = 2.4 - k * 5.6;
      pulse.current.position.set(Math.cos(ang) * r, 0.1, Math.sin(ang) * r);
      pulse.current.scale.setScalar(0.35 + k * 0.25);
      pulseMat.current.opacity = vis * galw * Math.sin(k * Math.PI);
    }
    if (newborn.current && newbornMat.current) {
      // the arriving energy reignites a new signal — growth is a loop
      const k = (t * 0.07 * sp) % 1;
      newbornMat.current.opacity = vis * galw * smooth(band(k, 0.82, 1.0)) * 0.9;
      newborn.current.scale.setScalar(0.5 + Math.sin(t * 3 * sp) * 0.08);
    }
  });

  return (
    <group ref={root} position={[0, 0.4, -6]} visible={false}>
      {/* the golden signal / newborn star / galactic core — one entity */}
      <sprite ref={core}>
        <spriteMaterial
          ref={coreMat}
          map={glowTex}
          color={GOLD}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </sprite>
      <pointLight ref={light} color={GOLD} intensity={0} distance={14} decay={2} />

      {/* stage 1 — radar rings */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          rotation={[-1.15, 0, 0]}
          ref={(el) => {
            rings.current[i] = el;
          }}
        >
          <ringGeometry args={[0.97, 1, 64]} />
          <meshBasicMaterial
            ref={(el) => {
              ringMats.current[i] = el;
            }}
            color={GOLD}
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </mesh>
      ))}

      {/* stage 1→2 — faint orbital network */}
      {orbitGeos.map((geo, i) => (
        <lineLoop
          key={i}
          geometry={geo}
          rotation={[1.05 - i * 0.32, i * 0.5, 0]}
        >
          <lineBasicMaterial
            ref={(el) => {
              orbitMats.current[i] = el;
            }}
            color="#7ea8ff"
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
          />
        </lineLoop>
      ))}

      {/* stage 1 — particles gathering toward the signal */}
      <points geometry={inflowGeo}>
        <shaderMaterial
          ref={inflowMat}
          vertexShader={INFLOW_VERT}
          fragmentShader={SOFT_DISC_FRAG}
          uniforms={{
            uTime: { value: 0 },
            uOpacity: { value: 0 },
            uColor: { value: new THREE.Color("#ffd27a") },
          }}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* stage 2 — nebula wisps */}
      {nebTex.map((tex, i) => (
        <sprite
          key={i}
          ref={(el) => {
            nebs.current[i] = el;
          }}
        >
          <spriteMaterial
            ref={(el) => {
              nebMats.current[i] = el;
            }}
            map={tex}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
      ))}

      {/* stage 2 — golden energy arcs */}
      {arcGeos.map((geo, i) => (
        <mesh
          key={i}
          geometry={geo}
          rotation={[0.6 + i * 0.4, i * 0.7, 0]}
          ref={(el) => {
            arcs.current[i] = el;
          }}
        >
          <meshBasicMaterial
            ref={(el) => {
              arcMats.current[i] = el;
            }}
            color={GOLD}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            fog={false}
          />
        </mesh>
      ))}

      {/* stage 3 — path lines + flowing energy + lit nodes */}
      {trailLines.map((l, i) => (
        <primitive key={i} object={l} />
      ))}

      <points ref={trailPts} geometry={trailGeo}>
        <pointsMaterial
          map={dotTex}
          color="#ffd27a"
          size={0.09}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {nodePositions.map((pos, i) => (
        <sprite key={i} position={pos} scale={0.28}>
          <spriteMaterial
            ref={(el) => {
              nodeMats.current[i] = el;
            }}
            map={glowTex}
            color={i % 2 ? "#7ea8ff" : GOLD}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
      ))}

      {/* stage 4 — the living galaxy + the returning pulse */}
      <group ref={galaxyGroup} rotation={[-0.55, 0, 0]}>
        <points geometry={galaxyGeo}>
          <shaderMaterial
            ref={galaxyMat}
            vertexShader={GALAXY_VERT}
            fragmentShader={GALAXY_FRAG}
            uniforms={{
              uTime: { value: 0 },
              uVis: { value: 0 },
              uSpread: { value: 0.5 },
            }}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <sprite ref={pulse}>
          <spriteMaterial
            ref={pulseMat}
            map={glowTex}
            color={GOLD}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>

        {/* a new signal forming at the journey's end — the loop continues */}
        <sprite ref={newborn} position={[4.7, 0.15, 1.6]}>
          <spriteMaterial
            ref={newbornMat}
            map={glowTex}
            color={GOLD}
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
          />
        </sprite>
      </group>
    </group>
  );
}
