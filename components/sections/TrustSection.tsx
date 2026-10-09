import SectionLabel from "@/components/ui/SectionLabel";
import { TRUST_LOGOS } from "@/data/trust";

type Dict = { label: string; title: string; body: string };

export default function TrustSection({ dict }: { dict: Dict }) {
  return (
    <section
      id="trust"
      className="section-pad relative flex min-h-[160vh] flex-col items-center justify-center py-28 text-center"
      data-band="trust"
    >
      <SectionLabel>{dict.label}</SectionLabel>
      <h2
        className="display mx-auto mt-6 max-w-4xl text-4xl sm:text-6xl lg:text-7xl"
        data-reveal="up"
      >
        {dict.title}
      </h2>
      <p
        className="mt-8 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
        data-reveal="up"
      >
        {dict.body}
      </p>

      {/* Text-level client list — the orbit above is decorative. */}
      <ul
        className="mx-auto mt-20 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-3"
        data-reveal="up"
      >
        {TRUST_LOGOS.map((logo) => (
          <li
            key={logo.id}
            className="font-mono text-[11px] uppercase tracking-[0.22em] text-mist"
          >
            {logo.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
