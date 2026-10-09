import Image from "next/image";
import { ArrowUp, ArrowUpRight, Mail, MapPin } from "lucide-react";
import { AGENCY } from "@/data/agency";

type FooterDict = {
  tagline: string;
  navLabel: string;
  contactLabel: string;
  visitLabel: string;
  visitLine: string;
  directions: string;
  mapTitle: string;
  rights: string;
  top: string;
};

type Nav = {
  home: string;
  about: string;
  services: string;
  works: string;
  contact: string;
};

type Props = {
  locale: string;
  dict: FooterDict;
  nav: Nav;
};

export default function Footer({ dict, nav }: Props) {
  const links = [
    { href: "#top", label: nav.home },
    { href: "#about", label: nav.about },
    { href: "#services", label: nav.services },
    { href: "#works", label: nav.works },
    { href: "#contact", label: nav.contact },
  ];

  return (
    <footer className="relative z-10 border-t border-line bg-ink">
      <div className="section-pad grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.65fr_0.85fr_1.1fr] lg:gap-10">
        <div className="flex flex-col gap-5">
          <Image
            src={AGENCY.logo}
            alt={AGENCY.name}
            width={1411}
            height={113}
            className="h-auto w-48 sm:w-52"
          />
          <p className="display text-2xl text-mist sm:text-3xl">
            {dict.tagline}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-2">
          <span className="kicker">{dict.navLabel}</span>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="font-mono text-xs uppercase tracking-[0.2em] text-mist transition-colors hover:text-paper"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-2">
          <span className="kicker">{dict.contactLabel}</span>
          <a
            href={`mailto:${AGENCY.email}`}
            className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-paper transition-colors hover:text-accent"
          >
            <Mail size={13} className="text-accent" aria-hidden="true" />
            {AGENCY.email}
          </a>

          <span className="kicker mt-7">{dict.visitLabel}</span>
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.12em] text-mist">
            <MapPin size={13} className="text-accent" aria-hidden="true" />
            {dict.visitLine}
          </p>
          <a
            href={AGENCY.location.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.2em] text-paper/70 transition-colors hover:text-accent"
          >
            {dict.directions}
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>

          <a
            href="#top"
            className="mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-mist transition-colors hover:text-paper"
          >
            <ArrowUp size={14} aria-hidden="true" />
            {dict.top}
          </a>
        </div>

        <div className="footer-map sm:col-span-2 lg:col-span-1">
          <iframe
            src={AGENCY.location.embed}
            title={dict.mapTitle}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      </div>

      <div className="section-pad border-t border-line py-5">
        <p className="font-mono text-[11px] tracking-[0.15em] text-mist">
          {dict.rights}
        </p>
      </div>
    </footer>
  );
}
