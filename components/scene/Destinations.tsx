"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import Planet, { PlanetPalette } from "./Planet";
import OrbitDust from "./OrbitDust";
import { band, sceneState, smooth } from "./scene-state";

type BandName =
  | "hero"
  | "intro"
  | "about"
  | "services"
  | "process"
  | "works"
  | "trust"
  | "industries";

type Spec = {
  band: BandName;
  radius: number;
  palette: PlanetPalette;
  seed: number;
  tilt?: number;
  ring?: { color: string; inner: number; outer: number } | null;
  moon?: boolean;
  /** far silhouette position (deep space) */
  far: [number, number, number];
  /** foreground position at the section's peak */
  near: [number, number, number];
};

/** One planet per section — each is a distinct world. Contact is the Sun
 *  (separate component); the works planet frames the project carousel. */
const SPECS: Spec[] = [
  {
    // hero — the ringed giant, the poster world
    band: "hero",
    radius: 2.7,
    seed: 3.1,
    tilt: 0.18,
    palette: {
      low: "#0a1024",
      mid: "#1c3a6e",
      high: "#5a8ad8",
      atmosphere: "#4a9fff",
    },
    ring: { color: "#e8a04c", inner: 1.45, outer: 2.1 },
    far: [11, -7, -46],
    near: [3.6, -1.1, 3.4],
  },
  {
    // intro — teal ocean world
    band: "intro",
    radius: 1.9,
    seed: 7.7,
    tilt: -0.1,
    palette: {
      low: "#03201f",
      mid: "#0d5a52",
      high: "#4fd0c0",
      atmosphere: "#4fd0c0",
    },
    far: [-12, 7, -44],
    near: [-3.8, 1.0, 2.6],
  },
  {
    // about — amber terrestrial planet with a moon
    band: "about",
    radius: 2.1,
    seed: 12.3,
    tilt: 0.14,
    palette: {
      low: "#241003",
      mid: "#6b3a10",
      high: "#d98a2b",
      atmosphere: "#f5a81c",
    },
    moon: true,
    far: [13, 8, -48],
    near: [4.0, 1.3, 2.8],
  },
  {
    // services — violet system anchor (its four moons = the disciplines)
    band: "services",
    radius: 1.7,
    seed: 21.9,
    tilt: -0.16,
    palette: {
      low: "#140a2e",
      mid: "#3c1f78",
      high: "#8b5cf6",
      atmosphere: "#a78bfa",
    },
    far: [-11, -8, -46],
    near: [-4.2, -1.4, 2.2],
  },
  {
    // process — bronze mechanical world with thin rings (movement)
    band: "process",
    radius: 1.3,
    seed: 31.4,
    tilt: 0.22,
    palette: {
      low: "#141417",
      mid: "#4a4a55",
      high: "#b8b0a0",
      atmosphere: "#c9a86a",
    },
    ring: { color: "#c9a86a", inner: 1.5, outer: 1.9 },
    far: [12, -6, -44],
    near: [5.2, -1.9, -8],
  },
  {
    // works — icy giant behind the project galaxy
    band: "works",
    radius: 3.2,
    seed: 44.1,
    tilt: -0.08,
    palette: {
      low: "#101820",
      mid: "#2e4a66",
      high: "#a8c8e8",
      atmosphere: "#8ac6ff",
    },
    far: [-14, 9, -52],
    near: [-5.2, 1.8, -2.4],
  },
  {
    // trust — green harbor world, center stage for the orbiting logos
    band: "trust",
    radius: 1.8,
    seed: 55.7,
    tilt: 0.1,
    palette: {
      low: "#0a1a12",
      mid: "#1f5a3a",
      high: "#6cc08a",
      atmosphere: "#5fd49a",
    },
    moon: true,
    far: [10, -9, -46],
    near: [0.6, -1.6, 1.6],
  },
  {
    // industries — crimson world
    band: "industries",
    radius: 1.5,
    seed: 68.2,
    tilt: -0.2,
    palette: {
      low: "#20060f",
      mid: "#5c1230",
      high: "#d84878",
      atmosphere: "#f06a9a",
    },
    ring: { color: "#f06a9a", inner: 1.55, outer: 2.0 },
    far: [-12, 8, -44],
    near: [-4.0, 1.1, 2.4],
  },
];

const SERVICE_MOON_COLORS = ["#f0a860", "#4a9fff", "#5fd49a", "#b49aff"];
const ATMO_COLORS = SPECS.map((s) => new THREE.Color(s.palette.atmosphere));

/**
 * The planetary system: every section owns a planet that travels from a
 * deep-space silhouette to a detailed foreground world as its band plays,
 * then slides past the camera as the next world arrives.
 */
export default function Destinations() {
  const groups = useRef<(THREE.Group | null)[]>([]);
  const moonsRef = useRef<THREE.Group>(null);
  const moonMeshes = useRef<(THREE.Mesh | null)[]>([]);
  const moonMats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const focusLight = useRef<THREE.PointLight>(null);

  useFrame(({ clock, size }) => {
    const t = clock.elapsedTime;
    const s = sceneState;
    const spin = s.reducedMotion ? 0.3 : 1;
    // Narrow viewports: pull planets closer to the axis so they stay in frame.
    const xr = THREE.MathUtils.clamp(size.width / 1280, 0.35, 1);

    let focusX = 0;
    let focusY = 0;
    let focusZ = -8;
    let focusW = 0;
    let focusI = -1;

    SPECS.forEach((spec, i) => {
      const g = groups.current[i];
      if (!g) return;
      const b = s[spec.band];
      const arrive = smooth(band(b, 0.04, 0.62));
      const pass = smooth(band(b, 0.72, 1.0));
      // Fade completes before the planet crosses the camera plane — an
      // additive atmosphere straddling the lens would wash the screen.
      const fade = 1 - smooth(band(b, 0.68, 0.88));

      g.position.set(
        THREE.MathUtils.lerp(spec.far[0], spec.near[0], arrive) * xr +
          pass * spec.far[0] * 0.45 * xr,
        THREE.MathUtils.lerp(spec.far[1], spec.near[1], arrive) + pass * 3.5,
        THREE.MathUtils.lerp(spec.far[2], spec.near[2], arrive) + pass * 12,
      );
      g.scale.setScalar((0.25 + arrive * 0.75) * (1 + pass * 0.5));
      g.rotation.y = t * 0.02 * spin;

      // The most visible planet claims the camera's gaze.
      const vis = Math.min(1, arrive * 1.15) * fade;
      if (vis > focusW) {
        focusW = vis;
        focusI = i;
        focusX = g.position.x;
        focusY = g.position.y;
        focusZ = g.position.z;
      }
    });

    // Environmental light: the stage takes on the active world's atmosphere
    // tint, so each arrival relights the void around it.
    const fl = focusLight.current;
    if (fl) {
      if (focusI >= 0 && focusW > 0.05) {
        fl.position.set(focusX, focusY, focusZ + 2);
        fl.color.lerp(ATMO_COLORS[focusI], 0.06);
        fl.intensity += (focusW * 7 - fl.intensity) * 0.08;
      } else {
        fl.intensity *= 0.95;
      }
    }

    const f = s.focus;
    const ease = 0.08;
    f.x += (focusX - f.x) * ease;
    f.y += (focusY - f.y) * ease;
    f.z += (focusZ - f.z) * ease;
    f.w += (focusW - f.w) * ease;

    // Four service moons orbit the violet planet; the focused one brightens
    // and swells as the matching service row is on screen.
    const servicesSpec = SPECS[3];
    const mg = moonsRef.current;
    if (mg) {
      const b = s.services;
      const arrive = smooth(band(b, 0.04, 0.62));
      const fade = 1 - smooth(band(b, 0.68, 0.88));
      mg.position.copy(
        groups.current[3]?.position ??
          new THREE.Vector3(...servicesSpec.near),
      );
      mg.scale.setScalar(0.25 + arrive * 0.75);
      const vis = Math.min(1, arrive * 1.15) * fade;

      moonMeshes.current.forEach((m, i) => {
        if (!m) return;
        const a = t * (0.22 + i * 0.07) * spin + i * 1.7;
        const r = servicesSpec.radius * (1.7 + i * 0.35);
        m.position.set(
          Math.cos(a) * r,
          Math.sin(a * 0.8 + i) * servicesSpec.radius * 0.55,
          Math.sin(a) * r,
        );
        const focus = Math.max(0, 1 - Math.abs(s.serviceFocus - i) / 0.8);
        m.scale.setScalar(1 + focus * 0.55);
        const mat = moonMats.current[i];
        if (mat) {
          mat.opacity = vis;
          mat.emissiveIntensity = 0.3 + focus * 1.0;
        }
      });
    }
  });

  return (
    <group>
      {SPECS.map((spec, i) => (
        <group
          key={spec.band}
          ref={(el) => {
            groups.current[i] = el;
          }}
          position={spec.far}
        >
          <Planet
            radius={spec.radius}
            palette={spec.palette}
            band={spec.band}
            seed={spec.seed}
            tilt={spec.tilt}
            ring={spec.ring}
            moon={spec.moon}
          />
          <OrbitDust
            radius={spec.radius}
            color={spec.palette.atmosphere}
            band={spec.band}
            seed={spec.seed}
          />
        </group>
      ))}

      {/* focus light — takes the active planet's atmosphere color */}
      <pointLight ref={focusLight} intensity={0} distance={26} decay={2} />

      {/* the services planetary system — one moon per discipline */}
      <group ref={moonsRef}>
        {SERVICE_MOON_COLORS.map((col, i) => (
          <mesh
            key={col}
            ref={(el) => {
              moonMeshes.current[i] = el;
            }}
          >
            <sphereGeometry args={[0.2, 24, 24]} />
            <meshStandardMaterial
              ref={(el) => {
                moonMats.current[i] = el;
              }}
              color="#1a1622"
              emissive={col}
              emissiveIntensity={0.4}
              roughness={0.4}
              transparent
              opacity={0}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
