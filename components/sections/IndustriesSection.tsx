"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { X } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";

type Dict = {
  label: string;
  title: string;
  items: string[];
  descs?: string[];
  close?: string;
};

/** Per-portal identity: palette + orbital composition offsets. */
const PORTALS = [
  { c1: "#4a9fff", c2: "#bfe0ff", dy: "-1.9rem", sc: 0.92 }, // Santé — radiant blue core
  { c1: "#7ec8ff", c2: "#e8f4ff", dy: "-0.4rem", sc: 1.0 }, // Cliniques — blue-white
  { c1: "#5fd4c0", c2: "#9fe8d8", dy: "-0.4rem", sc: 1.0 }, // Pharma — mint science
  { c1: "#f0a860", c2: "#ffd9a0", dy: "-1.9rem", sc: 0.92 }, // Commerce — warm gold
  { c1: "#e8823c", c2: "#ffc27a", dy: "-1.4rem", sc: 0.94 }, // Restauration — amber
  { c1: "#6ad0ff", c2: "#a8e8ff", dy: "0rem", sc: 1.02 }, // E-commerce — bright cyan
  { c1: "#6a8ad8", c2: "#b8ccff", dy: "0rem", sc: 1.02 }, // Secteur public — civic blue
  { c1: "#a78bfa", c2: "#d0b8ff", dy: "-1.4rem", sc: 0.94 }, // Startups — violet launch
];

/** Tiny orbiting motes living inside each gateway. */
function Orbs({ n = 5 }: { n?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <i key={i} className="pi-orb" style={{ "--i": i } as CSSProperties} />
      ))}
    </>
  );
}

/**
 * Miniature worlds — each built from layered SVG silhouettes and glowing
 * primitives on back/mid/fore planes, so pointer parallax produces real
 * depth inside the frame.
 */
function Interior({ i }: { i: number }) {
  switch (i) {
    case 0: // Santé — radiant healing core
      return (
        <>
          <span className="pi pi-back"><span className="pi-core" /></span>
          <span className="pi pi-mid">
            <i className="pi-cross" />
            <i className="pi-ring" />
          </span>
          <span className="pi pi-fore"><Orbs n={6} /></span>
        </>
      );
    case 1: // Cliniques privées — futuristic care building
      return (
        <>
          <span className="pi pi-back"><span className="pi-core pi-core-top" /></span>
          <span className="pi pi-mid">
            <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" aria-hidden="true">
              <rect x="38" y="46" width="44" height="86" rx="5" strokeWidth="1.4" opacity=".8" />
              <rect x="52" y="30" width="16" height="16" rx="3" strokeWidth="1.2" opacity=".6" />
              <line x1="60" y1="18" x2="60" y2="30" strokeWidth="1.2" opacity=".7" />
              {[0, 1, 2, 3, 4].map((r) =>
                [0, 1, 2].map((c) => (
                  <rect
                    key={`${r}${c}`}
                    x={46 + c * 13}
                    y={56 + r * 14}
                    width="6"
                    height="6"
                    rx="1"
                    fill="currentColor"
                    stroke="none"
                    opacity={((r + c) % 3) * 0.22 + 0.18}
                  />
                )),
              )}
              <line x1="26" y1="132" x2="94" y2="132" strokeWidth="1.2" opacity=".5" />
            </svg>
          </span>
          <span className="pi pi-fore"><Orbs n={4} /></span>
        </>
      );
    case 2: // Pharma — molecules and a capsule
      return (
        <>
          <span className="pi pi-back"><span className="pi-core" /></span>
          <span className="pi pi-mid">
            <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" aria-hidden="true">
              {[[60, 62], [86, 76], [74, 104], [46, 104], [34, 76]].map(([x, y], k) => (
                <g key={k}>
                  <line x1="60" y1="86" x2={x} y2={y} strokeWidth="1" opacity=".55" />
                  <circle cx={x} cy={y} r="5.5" strokeWidth="1.3" opacity=".9" />
                </g>
              ))}
              <circle cx="60" cy="86" r="7" strokeWidth="1.4" />
              <rect x="70" y="122" width="34" height="14" rx="7" strokeWidth="1.3" transform="rotate(-24 87 129)" opacity=".85" />
              <line x1="87" y1="122" x2="87" y2="136" strokeWidth="1" transform="rotate(-24 87 129)" opacity=".6" />
            </svg>
          </span>
          <span className="pi pi-fore"><Orbs n={5} /></span>
        </>
      );
    case 3: // Commerce — geometric products in golden light
      return (
        <>
          <span className="pi pi-back"><span className="pi-core" /></span>
          <span className="pi pi-mid">
            <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M60 50 86 64v26l-26 14-26-14V64l26-14Z" strokeWidth="1.4" opacity=".9" />
              <path d="M34 64l26 14 26-14M60 104V78" strokeWidth="1" opacity=".5" />
              <rect x="30" y="112" width="60" height="4" rx="2" opacity=".55" />
              <circle cx="88" cy="118" r="9" strokeWidth="1.2" opacity=".7" />
              <circle cx="88" cy="118" r="3" fill="currentColor" stroke="none" opacity=".8" />
            </svg>
          </span>
          <span className="pi pi-fore"><Orbs n={4} /></span>
        </>
      );
    case 4: // Restauration — cloche and rising steam
      return (
        <>
          <span className="pi pi-back"><span className="pi-core" /></span>
          <span className="pi pi-mid">
            <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M34 108a26 26 0 0 1 52 0Z" strokeWidth="1.5" />
              <circle cx="60" cy="78" r="3" strokeWidth="1.3" />
              <line x1="26" y1="112" x2="94" y2="112" strokeWidth="1.4" opacity=".8" />
              <path className="pi-steam" d="M50 64c-3-6 3-8 0-14" strokeWidth="1.2" opacity=".7" />
              <path className="pi-steam" style={{ animationDelay: "-1.6s" }} d="M60 60c-3-6 3-8 0-14" strokeWidth="1.2" opacity=".55" />
              <path className="pi-steam" style={{ animationDelay: "-3s" }} d="M70 64c-3-6 3-8 0-14" strokeWidth="1.2" opacity=".7" />
            </svg>
          </span>
          <span className="pi pi-fore"><Orbs n={4} /></span>
        </>
      );
    case 5: // E-commerce — parcel on a delivery route
      return (
        <>
          <span className="pi pi-back"><span className="pi-core" /></span>
          <span className="pi pi-mid">
            <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" aria-hidden="true">
              <path className="pi-trail" d="M16 118C40 118 40 96 62 96s34-22 46-44" strokeWidth="1.2" strokeDasharray="4 6" opacity=".7" />
              <path d="M60 62l20 10v20l-20 10-20-10V72l20-10Z" strokeWidth="1.4" />
              <path d="M40 72l20 10 20-10M60 102V82" strokeWidth="1" opacity=".55" />
              {[16, 108].map((y, k) => (
                <circle key={k} cx={k ? 108 : 16} cy={y} r="3" strokeWidth="1.2" opacity=".9" />
              ))}
              <circle cx="108" cy="52" r="2" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <span className="pi pi-fore"><Orbs n={5} /></span>
        </>
      );
    case 6: // Secteur public — monumental civic facade
      return (
        <>
          <span className="pi pi-back"><span className="pi-core" /></span>
          <span className="pi pi-mid">
            <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M60 40 30 62h60L60 40Z" strokeWidth="1.4" />
              <line x1="34" y1="68" x2="86" y2="68" strokeWidth="1.3" opacity=".8" />
              {[42, 54, 66, 78].map((x) => (
                <line key={x} x1={x} y1="74" x2={x} y2="112" strokeWidth="2.6" opacity=".85" />
              ))}
              <line x1="32" y1="118" x2="88" y2="118" strokeWidth="1.4" />
              <line x1="26" y1="126" x2="94" y2="126" strokeWidth="1.4" opacity=".6" />
              <circle cx="60" cy="54" r="3" strokeWidth="1.1" opacity=".8" />
            </svg>
          </span>
          <span className="pi pi-fore"><Orbs n={3} /></span>
        </>
      );
    default: // Startups — launch
      return (
        <>
          <span className="pi pi-back"><span className="pi-core" /></span>
          <span className="pi pi-mid">
            <svg viewBox="0 0 120 160" fill="none" stroke="currentColor" aria-hidden="true">
              <path d="M60 42c10 10 12 30 4 44l-4-2-4 2c-8-14-6-34 4-44Z" strokeWidth="1.5" />
              <circle cx="60" cy="66" r="5" strokeWidth="1.2" opacity=".8" />
              <path d="M56 86c-4 8-4 14 0 20M64 86c4 8 4 14 0 20" strokeWidth="1.1" opacity=".55" />
              <path className="pi-flame" d="M60 88c-3 6-3 12 0 18 3-6 3-12 0-18Z" fill="currentColor" stroke="none" opacity=".8" />
              <path className="pi-streak" d="M34 118h14" strokeWidth="1.4" />
              <path className="pi-streak" style={{ animationDelay: "-1.2s" }} d="M72 124h16" strokeWidth="1.4" />
              <path className="pi-streak" style={{ animationDelay: "-2.4s" }} d="M40 132h12" strokeWidth="1.4" />
            </svg>
          </span>
          <span className="pi pi-fore"><Orbs n={6} /></span>
        </>
      );
  }
}

/** One gateway — arch frame, inner world, floor light, name + descriptor. */
function Portal({
  i,
  name,
  desc,
  onOpen,
  register,
}: {
  i: number;
  name: string;
  desc?: string;
  onOpen: () => void;
  register: (el: HTMLButtonElement | null) => void;
}) {
  const s = PORTALS[i];
  return (
    <li
      className="portal-item"
      data-reveal="up"
      style={
        {
          "--c1": s.c1,
          "--c2": s.c2,
          "--dy": s.dy,
          "--pz": s.sc,
          "--ph": i * -1.35,
        } as CSSProperties
      }
    >
      <button
        ref={register}
        type="button"
        className="portal"
        onClick={onOpen}
        aria-haspopup="dialog"
      >
        <span className="portal-float">
          <span className="portal-gate" style={{ color: s.c2 }}>
            <span className="portal-rim" aria-hidden="true" />
            <span className="portal-scene">
              <Interior i={i} />
              <span className="pi pi-haze" aria-hidden="true" />
            </span>
            <span className="portal-floor" aria-hidden="true" />
          </span>
        </span>
        <span className="portal-name">{name}</span>
        {desc && <span className="portal-desc">{desc}</span>}
      </button>
    </li>
  );
}

export default function IndustriesSection({ dict }: { dict: Dict }) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState<number | null>(null);

  const openPortal = useCallback((i: number) => setOpen(i), []);
  const closePortal = useCallback(() => setOpen(null), []);

  // Esc to leave the portal; focus the close button on entry, restore on exit.
  useEffect(() => {
    if (open === null) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open]);

  /**
   * Pointer-driven world: the whole field breathes with the cursor and
   * each portal tracks its own local offset + proximity, so near portals
   * react more than far ones. Damped and idle-stopping — no work when the
   * pointer rests.
   */
  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let tx = -9999;
    let ty = -9999;
    let cx = -9999;
    let cy = -9999;

    const tick = () => {
      raf = 0;
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      field.style.setProperty("--mx", String((cx / innerWidth) * 2 - 1));
      field.style.setProperty("--my", String((cy / innerHeight) * 2 - 1));
      for (const el of btnRefs.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        const px = (cx - (r.left + r.width / 2)) / r.width;
        const py = (cy - (r.top + r.height / 2)) / r.height;
        const dist = Math.hypot(px, py);
        el.style.setProperty("--px", String(Math.max(-1.6, Math.min(1.6, px))));
        el.style.setProperty("--py", String(Math.max(-1.6, Math.min(1.6, py))));
        el.style.setProperty("--near", String(Math.max(0, 1 - dist / 1.9)));
      }
      if (Math.hypot(tx - cx, ty - cy) > 0.4) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    field.addEventListener("pointermove", onMove);
    return () => {
      field.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="relative flex min-h-[150vh] flex-col justify-center overflow-hidden py-28"
      data-band="industries"
    >
      {/* cosmic dressing — nebula wash + faint orbital arcs */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute left-1/2 top-1/2 h-[70vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(96,74,200,0.16),rgba(70,96,210,0.07)_45%,transparent_72%)]" />
        <svg
          className="absolute left-1/2 top-1/2 h-[110%] w-[150%] -translate-x-1/2 -translate-y-1/2 opacity-[0.14]"
          viewBox="0 0 1200 600"
          fill="none"
          preserveAspectRatio="none"
        >
          <ellipse cx="600" cy="300" rx="560" ry="170" stroke="url(#orb-a)" strokeWidth="1" />
          <ellipse cx="600" cy="300" rx="440" ry="110" stroke="url(#orb-a)" strokeWidth="0.7" strokeDasharray="2 7" />
          <defs>
            <linearGradient id="orb-a" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8b7cf6" stopOpacity="0" />
              <stop offset="0.25" stopColor="#8b7cf6" />
              <stop offset="0.75" stopColor="#5a8ad8" />
              <stop offset="1" stopColor="#5a8ad8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="section-pad relative z-10 mb-10 flex flex-col items-center text-center sm:mb-16">
        <SectionLabel>{dict.label}</SectionLabel>
        <h2
          className="display mt-6 max-w-4xl text-balance text-4xl sm:text-6xl"
          data-reveal="up"
        >
          {dict.title}
        </h2>
      </div>

      <div ref={fieldRef} className="portal-field relative z-10" data-open={open !== null || undefined}>
        <ul className="portal-grid">
          {dict.items.map((name, i) => (
            <Portal
              key={name}
              i={i}
              name={name}
              desc={dict.descs?.[i]}
              onOpen={() => openPortal(i)}
              register={(el) => {
                btnRefs.current[i] = el;
              }}
            />
          ))}
        </ul>
      </div>

      {/* expanded portal — the gateway fills the stage, others recede */}
      {open !== null && (
        <div className="portal-overlay" role="dialog" aria-modal="true" aria-label={dict.items[open]}>
          <button
            className="portal-overlay-bg"
            onClick={closePortal}
            aria-label={dict.close ?? "Close"}
            tabIndex={-1}
          />
          <div className="portal-card" style={{ "--c1": PORTALS[open].c1, "--c2": PORTALS[open].c2 } as CSSProperties}>
            <span className="portal-gate portal-gate-lg" style={{ color: PORTALS[open].c2 }}>
              <span className="portal-rim" aria-hidden="true" />
              <span className="portal-scene">
                <Interior i={open} />
                <span className="pi pi-haze" aria-hidden="true" />
              </span>
              <span className="portal-floor" aria-hidden="true" />
            </span>
            <h3 className="portal-card-name">{dict.items[open]}</h3>
            {dict.descs?.[open] && <p className="portal-card-desc">{dict.descs[open]}</p>}
            <button ref={closeRef} type="button" className="portal-close" onClick={closePortal}>
              <X size={16} aria-hidden="true" />
              <span>{dict.close ?? "Close"}</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
