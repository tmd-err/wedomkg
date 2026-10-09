import { lang } from "next/root-params";
import { getDictionary } from "@/i18n/dictionaries";

export default async function NotFound() {
  const locale = await lang();
  const dict = await getDictionary(locale);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 section-pad text-center">
      <p className="kicker">WE DO MARKETING — 404</p>
      <h1 className="display text-4xl sm:text-6xl">{dict.notFound.title}</h1>
      <a
        href={`/${locale}`}
        className="border border-line px-6 py-3 font-mono text-xs tracking-[0.25em] uppercase text-paper transition-colors hover:border-accent hover:text-accent"
      >
        {dict.notFound.cta}
      </a>
    </main>
  );
}
