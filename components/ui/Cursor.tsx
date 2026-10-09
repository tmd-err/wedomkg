"use client";

import { useEffect, useRef } from "react";

const CRUMB_DISTANCE = 20; // px of pointer travel between crumbs — keeps it sparse
const MAX_CRUMBS = 40;

/**
 * Custom cursor: an amber dot inside a thin ring, followed by a sparse
 * trail of small neon crumbs that fade quickly. Fine pointers only.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.documentElement.classList.add("has-cursor");

    const lastCrumb = { x: -1e4, y: -1e4 };
    const crumbs: HTMLDivElement[] = [];

    const onMove = (e: PointerEvent) => {
      const t = `translate(${e.clientX}px, ${e.clientY}px)`;
      d.style.transform = t;
      r.style.transform = t;
      d.classList.remove("is-hidden");
      r.classList.remove("is-hidden");

      const dx = e.clientX - lastCrumb.x;
      const dy = e.clientY - lastCrumb.y;
      const gap = reduced ? CRUMB_DISTANCE * 1.8 : CRUMB_DISTANCE;
      if (dx * dx + dy * dy < gap * gap) return;
      lastCrumb.x = e.clientX;
      lastCrumb.y = e.clientY;

      if (crumbs.length >= MAX_CRUMBS) crumbs.shift()?.remove();
      const c = document.createElement("div");
      c.className = "cursor-crumb";
      c.style.left = `${e.clientX}px`;
      c.style.top = `${e.clientY}px`;
      c.style.setProperty("--dx", `${(Math.random() - 0.5) * 14}px`);
      c.addEventListener("animationend", () => c.remove(), { once: true });
      document.body.appendChild(c);
      crumbs.push(c);
    };

    const onLeave = () => {
      d.classList.add("is-hidden");
      r.classList.add("is-hidden");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      crumbs.forEach((c) => c.remove());
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot is-hidden" aria-hidden="true" />
      <div ref={ring} className="cursor-ring is-hidden" aria-hidden="true" />
    </>
  );
}
