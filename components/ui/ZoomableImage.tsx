"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, X } from "lucide-react";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  /** Localized a11y label for the zoom affordance, e.g. "Enlarge image". */
  zoomLabel: string;
};

/**
 * Inline image that opens a full-viewport lightbox on click — the editorial
 * images carry small text the user must be able to read. Escape, the close
 * button, or a backdrop click dismiss it. `data-lenis-prevent` keeps Lenis
 * from hijacking wheel events while the overlay is open.
 */
export default function ZoomableImage({
  src,
  alt,
  width,
  height,
  sizes,
  zoomLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const triggerEl = trigger.current;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      triggerEl?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`${zoomLabel} — ${alt}`}
        className="group relative block w-full"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className="h-auto w-full"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center border border-line bg-ink/70 text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          <Maximize2 size={15} />
        </span>
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            data-lenis-prevent
            onClick={() => setOpen(false)}
            className="img-zoom-overlay fixed inset-0 z-[200] flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm sm:p-10"
          >
            <button
              ref={closeBtn}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center border border-line bg-ink text-paper transition-colors hover:border-accent hover:text-accent sm:right-8 sm:top-8"
            >
              <X size={18} aria-hidden="true" />
            </button>
            {/* Plain img: the webp is already loaded and lightbox sizing
                needs unconstrained max dimensions rather than next/image fill. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-full max-w-full border border-line object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
