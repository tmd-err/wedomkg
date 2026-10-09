"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { sceneState } from "@/components/scene/scene-state";
import ErrorBoundary from "@/components/ErrorBoundary";
import Cursor from "@/components/ui/Cursor";

// The WebGL scene never renders on the server — it only exists client-side.
const MarketingScene = dynamic(() => import("@/components/scene/MarketingScene"), {
  ssr: false,
});

type Props = {
  children: ReactNode;
  preloader: { brand: string; status: string };
};

export default function Experience({ children, preloader }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let introTimer = 0;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sceneState.reducedMotion = reduced;

    // --- Lenis smooth scroll, synchronized with ScrollTrigger ---
    let lenis: Lenis | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.1, anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
      tickerFn = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    }

    const rowListeners: { el: HTMLElement; on: () => void; off: () => void }[] = [];
    const ctx = gsap.context(() => {
      // Global scroll progress drives the whole scene state.
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          sceneState.progress = self.progress;
        },
      });

      // Per-section local progress for detailed choreography.
      gsap.utils
        .toArray<HTMLElement>("[data-band]")
        .forEach((el) => {
          const name = el.dataset.band as
            | "hero"
            | "intro"
            | "about"
            | "services"
            | "works"
            | "trust"
            | "process"
            | "industries"
            | "contact";
          ScrollTrigger.create({
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              sceneState[name] = self.progress;
            },
          });
        });

      // Direction-aware reveals: data-reveal="up|down|left|right" picks the
      // entry side. Elements already on screen at load get a proper intro
      // once the preloader lifts instead of a scrubbed entry. Under
      // prefers-reduced-motion the travel distance shrinks to a gentle drift
      // rather than disabling the animation outright.
      const m = reduced ? 0.22 : 1;
      const intro: { el: HTMLElement; from: gsap.TweenVars }[] = [];
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const dir = el.dataset.reveal || "up";
        const from: gsap.TweenVars = { opacity: 0, x: 0, y: 0, scale: 1 };
        if (dir === "down") from.y = 60 * m;
        else if (dir === "left") from.x = -90 * m;
        else if (dir === "right") from.x = 90 * m;
        else if (dir === "zoom") {
          from.y = 30 * m;
          from.scale = 0.92;
        } else from.y = -60 * m;

        if (el.getBoundingClientRect().top < window.innerHeight * 0.96) {
          gsap.set(el, from);
          intro.push({ el, from });
          return;
        }

        gsap.fromTo(el, from, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 96%",
            end: "top 60%",
            scrub: true,
          },
        });
      });

      let introPlayed = false;
      const playIntro = () => {
        if (introPlayed) return;
        introPlayed = true;
        intro.forEach(({ el, from }, i) => {
          gsap.fromTo(el, from, {
            x: 0,
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 1.05,
            ease: "power3.out",
            delay: 0.08 + i * 0.1,
          });
        });
      };
      window.addEventListener("wedomkg:scene-ready", playIntro, {
        once: true,
      });
      introTimer = window.setTimeout(playIntro, 4200);

      // Skipped past? Elements shade away instead of hard-clipping at the
      // top edge of the viewport.
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "bottom 48%",
              end: "bottom 10%",
              scrub: true,
            },
          },
        );
      });

      // Process cards get a launched entrance instead of a scrub — they
      // rush in fast and decelerate hard (expo.out), with a slight tilt.
      // Reverses when the user scrolls back up so it stays dynamic.
      gsap.utils.toArray<HTMLElement>("[data-rush]").forEach((el) => {
        const fromRight = el.dataset.rush === "right";
        gsap.from(el, {
          x: (fromRight ? 150 : -150) * m,
          y: 40 * m,
          opacity: 0,
          scale: 0.92,
          rotateZ: (fromRight ? 1.6 : -1.6) * m,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
        gsap.fromTo(
          el,
          { opacity: 1 },
          {
            opacity: 0,
            ease: "none",
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "bottom 48%",
              end: "bottom 10%",
              scrub: true,
            },
          },
        );
      });


      // Active state on portfolio rows as they pass the centre.
      gsap.utils.toArray<HTMLElement>("[data-work-row]").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 68%",
          end: "bottom 42%",
          toggleClass: { targets: el, className: "is-active" },
        });
        // Row interaction lights the matching portal — pointerenter covers
        // mouse and touch tap, focusin covers keyboard navigation.
        const on = () => {
          sceneState.workHover = i;
        };
        const off = () => {
          if (sceneState.workHover === i) sceneState.workHover = -1;
        };
        el.addEventListener("pointerenter", on);
        el.addEventListener("pointerleave", off);
        el.addEventListener("focusin", on);
        el.addEventListener("focusout", off);
        rowListeners.push({ el, on, off });
      });

      // Continuous focus values for scene choreography: data-focus="services|works"
      // on a list yields index + fractional progress across its rows.
      gsap.utils.toArray<HTMLElement>("[data-focus]").forEach((el) => {
        const kind = el.dataset.focus;
        const rows = el.querySelectorAll("[data-focus-row]").length;
        if (!rows) return;
        ScrollTrigger.create({
          trigger: el,
          start: "top 70%",
          end: "bottom 30%",
          onUpdate: (self) => {
            // -0.5 shifts focus so row i centers exactly on integer i.
            const value = self.progress * rows - 0.5;
            if (kind === "services") sceneState.serviceFocus = value;
            if (kind === "works") sceneState.workFocus = value;
            if (kind === "process") sceneState.processFocus = value;
          },
        });
      });
    }, root);

    // --- Pointer parallax for the scene ---
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // --- Preloader release ---
    const onReady = () => setReady(true);
    window.addEventListener("wedomkg:scene-ready", onReady, { once: true });
    const failsafe = window.setTimeout(() => setReady(true), 3500);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      rowListeners.forEach(({ el, on, off }) => {
        el.removeEventListener("pointerenter", on);
        el.removeEventListener("pointerleave", off);
        el.removeEventListener("focusin", on);
        el.removeEventListener("focusout", off);
      });
      lenis?.destroy();
      if (tickerFn) gsap.ticker.remove(tickerFn);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("wedomkg:scene-ready", onReady);
      window.clearTimeout(failsafe);
      window.clearTimeout(introTimer);
    };
  }, []);

  return (
    <>
      <div
        className={`preloader ${ready ? "is-done" : ""}`}
        role="status"
        aria-label={preloader.status}
      >
        <span className="display text-2xl tracking-tight sm:text-4xl">
          {preloader.brand}
        </span>
        <span className="preloader-bar" aria-hidden="true">
          <span />
        </span>
      </div>

      <ErrorBoundary fallback={null}>
        <MarketingScene />
      </ErrorBoundary>

      <Cursor />

      <div ref={root} className="relative z-10">
        {children}
      </div>
    </>
  );
}
