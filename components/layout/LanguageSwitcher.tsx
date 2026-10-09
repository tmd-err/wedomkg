"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { locales } from "@/i18n/config";

type Props = {
  locale: string;
  label: string;
};

export default function LanguageSwitcher({ locale, label }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const hrefFor = (l: string) => {
    const rest = pathname.replace(/^\/(en|fr)/, "");
    return `/${l}${rest === "" ? "" : rest}`;
  };

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] opacity-80 transition-opacity hover:opacity-100"
      >
        <Globe size={15} strokeWidth={1.6} aria-hidden="true" />
        {locale}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="absolute right-0 top-full mt-3 flex min-w-[6.5rem] flex-col overflow-hidden rounded-sm border border-white/15 bg-[#0c0b09]/95 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.9)] backdrop-blur-md"
        >
          {locales.map((l) => (
            <a
              key={l}
              href={hrefFor(l)}
              role="option"
              aria-selected={l === locale}
              onClick={(e) => {
                // Preserve the current section across the language switch.
                e.preventDefault();
                setOpen(false);
                window.location.href = hrefFor(l) + window.location.hash;
              }}
              className={`flex items-center gap-2.5 px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
                l === locale
                  ? "text-accent"
                  : "text-paper/60 hover:bg-white/5 hover:text-paper"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-1 w-1 rounded-full ${
                  l === locale ? "bg-accent" : "bg-transparent"
                }`}
              />
              {l}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
