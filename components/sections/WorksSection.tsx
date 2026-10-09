import { ArrowUpRight } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import { PROJECTS } from "@/data/projects";
import type { Locale } from "@/i18n/config";

type Dict = {
  label: string;
  title: string;
  visit: string;
};

/**
 * Editorial project list — the DOM provides the names, the 3D scene shows
 * the real screenshots flying on the carousel (ProjectScreens.tsx) as the
 * scroll focus sweeps across the rows.
 */
export default function WorksSection({
  dict,
  locale,
}: {
  dict: Dict;
  locale: string;
}) {
  const l: Locale = locale === "fr" ? "fr" : "en";

  return (
    <section
      id="works"
      className="section-pad relative py-28"
      data-band="works"
      style={{ minHeight: "420vh" }}
    >
      <div className="mb-10 max-w-3xl">
        <SectionLabel>{dict.label}</SectionLabel>
        <h2
          className="display mt-6 text-4xl sm:text-6xl lg:text-7xl"
          data-reveal="left"
        >
          {dict.title}
        </h2>
      </div>

      <ol data-focus="works">
        {PROJECTS.map((project, i) => (
          <li
            key={project.id}
            data-work-row
            data-focus-row
            data-reveal={i % 2 ? "right" : "left"}
            className="work-row group"
          >
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[52vh] flex-wrap content-center items-center gap-x-5 gap-y-4 py-9 sm:flex-nowrap sm:gap-8"
            >
              <span className="kicker shrink-0">
                {String(i + 1).padStart(2, "0")} /{" "}
                {String(PROJECTS.length).padStart(2, "0")}
              </span>
              <div className="w-full min-w-0 sm:w-auto sm:max-w-[52%]">
                <h3 className="work-name display text-3xl leading-none sm:text-5xl lg:text-6xl">
                  {project.name}
                </h3>
                <span className="work-meta mt-3 block font-mono text-[11px] uppercase tracking-[0.24em] text-mist transition-colors">
                  {project.tag[l]}
                </span>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
                  {project.description[l]}
                </p>
              </div>
              <span className="work-visit inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-accent sm:ml-auto">
                {dict.visit}
                <ArrowUpRight size={13} aria-hidden="true" />
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
