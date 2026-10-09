"use client";

import Image from "next/image";
import LanguageSwitcher from "./LanguageSwitcher";
import { AGENCY } from "@/data/agency";

type Nav = {
  home: string;
  about: string;
  services: string;
  works: string;
  contact: string;
};

type Props = {
  locale: string;
  nav: Nav;
  cta: string;
  languageLabel: string;
};

export default function Header({ locale, nav, cta, languageLabel }: Props) {
  const links: { href: string; label: string }[] = [
    { href: "#about", label: nav.about },
    { href: "#services", label: nav.services },
    { href: "#works", label: nav.works },
    { href: "#contact", label: nav.contact },
  ];

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50">
      <div className="section-pad flex h-16 items-center justify-between sm:h-20">
        <a
          href="#top"
          aria-label={AGENCY.name}
          className="flex items-center gap-3"
        >
          <Image
            src={AGENCY.logo}
            alt={AGENCY.name}
            width={200}
            height={16}
            className="h-4 w-auto sm:h-5"
            priority
          />
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-[11px] uppercase tracking-[0.22em] opacity-70 transition-opacity hover:opacity-100"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <a
            href="#contact"
            className="hidden font-mono text-[11px] uppercase tracking-[0.22em] opacity-80 transition-opacity hover:opacity-100 sm:inline-block md:hidden"
          >
            {cta}
          </a>
          <LanguageSwitcher locale={locale} label={languageLabel} />
        </div>
      </div>
    </header>
  );
}
