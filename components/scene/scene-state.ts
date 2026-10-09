/**
 * Shared mutable state between the DOM scroll choreography (GSAP ScrollTrigger,
 * written every scroll frame) and the WebGL frame loop (read every render).
 * Intentionally NOT React state — updating React state per frame would
 * re-render the whole tree.
 */
export const sceneState = {
  /** Global page scroll progress, 0..1 */
  progress: 0,
  /** Normalized pointer position, -1..1 */
  pointer: { x: 0, y: 0 },
  /** Per-section local progress, 0..1 while the section crosses the viewport */
  services: 0,
  process: 0,
  works: 0,
  trust: 0,
  industries: 0,
  /**
   * Continuous row focus, driven by each list's scroll position:
   * integer part = row index, fractional part = progress through the row.
   */
  serviceFocus: 0,
  workFocus: 0,
  /** Current z-offset of the funnel tunnel (written by Funnel each frame). */
  funnelZ: 0,
  reducedMotion: false,
};

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Normalized progress of `p` inside the [a, b] range. */
export const band = (p: number, a: number, b: number) =>
  clamp01((p - a) / (b - a));

/** Smoothstep easing. */
export const smooth = (t: number) => t * t * (3 - 2 * t);

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Fade-in over [in0,in1] then fade-out over [out0,out1]. */
export const windowBand = (
  p: number,
  in0: number,
  in1: number,
  out0: number,
  out1: number,
) => smooth(band(p, in0, in1)) * (1 - smooth(band(p, out0, out1)));
