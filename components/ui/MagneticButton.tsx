"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";

type Props = {
  href: string;
  label: string;
  variant?: "solid" | "ghost";
  external?: boolean;
  className?: string;
  icon?: ReactNode;
};

export default function MagneticButton({
  href,
  label,
  variant = "solid",
  external = false,
  className = "",
  icon,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(el, { x: x * 0.25, y: y * 0.25, duration: 0.4, ease: "power2.out" });
  };

  const onLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.5)" });
  };

  const base =
    "inline-flex items-center gap-2 px-7 py-3.5 font-mono text-xs uppercase tracking-[0.22em] transition-colors duration-300 will-change-transform";
  const skin =
    variant === "solid"
      ? "bg-accent text-ink hover:bg-paper"
      : "border border-line text-paper hover:border-accent hover:text-accent";

  return (
    <a
      ref={ref}
      href={href}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`${base} ${skin} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {icon}
      {label}
    </a>
  );
}
