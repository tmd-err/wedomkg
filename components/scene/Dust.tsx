"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { band, sceneState, smooth } from "./scene-state";
import { CURSOR_PUSH, hash, SOFT_DISC_FRAG } from "./shaders";

const DUST_VERT = /* glsl */ `
attribute float aSize;
attribute float aPhase;
attribute float aTw;
attribute float aDrift;
uniform float uTime;
uniform float uPixelRatio;
uniform float uDriftMul;
uniform vec2 uCursor;
uniform float uCursorStr;
varying vec3 vColor;
varying float vA;
void main(){
  vColor = color;
  float tw = 0.6 + 0.4 * sin(uTime * aTw + aPhase);
  vA = tw;
  vec3 p = position;
  // slow three-axis wandering — motes, not stars
  p += vec3(
    sin(uTime * 0.07 + aPhase * 3.1),
    cos(uTime * 0.05 + aPhase * 1.9),
    sin(uTime * 0.045 + aPhase * 5.2)
  ) * aDrift * uDriftMul;
  vec4 wp = modelMatrix * vec4(p, 1.0);
  ${CURSOR_PUSH}
  vec4 mv = viewMatrix * wp;
  gl_PointSize = aSize * tw * uPixelRatio * (170.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`;

/**
 * Cosmic dust — a few hundred motes suspended in a wide slab around the
 * journey corridor. They wander slowly, twinkle faintly, part around the
 * cursor, and thicken slightly while travelling between destinations.
 */
export default function Dust() {
  const pts = useRef<THREE.Points>(null);
  const mat = useRef<THREE.ShaderMaterial>(null);
  const cursor = useRef(new THREE.Vector2(0, 0));

  const mobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 700,
    [],
  );

  const { geo, uniforms } = useMemo(() => {
    const count = mobile ? 200 : 420;
    const blue = new THREE.Color("#7ea8ff");
    const violet = new THREE.Color("#b49aff");
    const cyan = new THREE.Color("#7ff3ff");
    const amber = new THREE.Color("#f5a81c");
    const mist = new THREE.Color("#d8d2c4");

    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const tw = new Float32Array(count);
    const drift = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const a = hash(i * 4.3) * Math.PI * 2;
      const r = 2 + hash(i * 8.1) * 14; // annulus — keeps the text column airy
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = (hash(i * 6.7) - 0.5) * 12;
      pos[i * 3 + 2] = -hash(i * 2.9) * 34 + 4;

      const pick = hash(i * 11.3);
      const c =
        pick < 0.34 ? blue : pick < 0.58 ? violet : pick < 0.78 ? cyan : pick < 0.92 ? mist : amber;
      const dim = 0.4 + hash(i * 15.7) * 0.5;
      col[i * 3] = c.r * dim;
      col[i * 3 + 1] = c.g * dim;
      col[i * 3 + 2] = c.b * dim;

      size[i] = 0.35 + hash(i * 19.3) * 1.0;
      phase[i] = hash(i * 23.9) * Math.PI * 2;
      tw[i] = 0.3 + hash(i * 27.1) * 1.4;
      drift[i] = 0.4 + hash(i * 31.1) * 1.1;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    geo.setAttribute("aTw", new THREE.BufferAttribute(tw, 1));
    geo.setAttribute("aDrift", new THREE.BufferAttribute(drift, 1));

    return {
      geo,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: 1 },
        uDriftMul: { value: 1 },
        uCursor: { value: new THREE.Vector2(0, 0) },
        uCursorStr: { value: 0.55 },
        uOpacity: { value: 0.5 },
      },
    };
  }, [mobile]);

  useFrame(({ clock, size }) => {
    const t = clock.elapsedTime;
    const reduced = sceneState.reducedMotion;
    const u = mat.current?.uniforms;
    if (!u) return;

    // Approaching the final destination, the dust calms and thins —
    // the frame settles into a quiet, welcoming composition.
    const calm = 1 - smooth(band(sceneState.contact, 0.1, 0.7)) * 0.6;

    u.uTime.value = reduced ? t * 0.3 : t;
    u.uDriftMul.value = (reduced ? 0.3 : 1) * calm;
    u.uPixelRatio.value = Math.min(window.devicePixelRatio, 1.75);

    // Dust thickens slightly between destinations — traveling through space
    // should feel denser than parked at a planet.
    const travel = Math.max(
      band(sceneState.hero, 0.7, 1.0) * (1 - band(sceneState.about, 0, 0.3)),
      band(sceneState.services, 0.7, 1.0) * (1 - band(sceneState.works, 0, 0.3)),
      band(sceneState.works, 0.7, 1.0) * (1 - band(sceneState.contact, 0, 0.3)),
      smooth(Math.sin(sceneState.progress * Math.PI) * 0.5 + 0.35),
    );
    u.uOpacity.value = (0.32 + smooth(Math.min(travel, 1)) * 0.3) * calm;

    // Smoothed world cursor — dust responds more strongly than stars.
    const px = sceneState.pointer.x * (reduced ? 0 : 1);
    const py = -sceneState.pointer.y * (reduced ? 0 : 1);
    const tx = px * 3.2 * (size.width / size.height);
    const ty = py * 3.2;
    cursor.current.x += (tx - cursor.current.x) * 0.05;
    cursor.current.y += (ty - cursor.current.y) * 0.05;
    (u.uCursor.value as THREE.Vector2).copy(cursor.current);

    // Whole-field scroll pull + slow tumble.
    const o = pts.current;
    if (o) {
      o.position.z = sceneState.progress * 10;
      o.rotation.z = t * 0.006 * (reduced ? 0.3 : 1);
      o.position.x = px * 0.4;
      o.position.y = py * 0.25;
    }
  });

  return (
    <points ref={pts} geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        uniforms={uniforms}
        vertexShader={DUST_VERT}
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
