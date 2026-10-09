import SectionLabel from "@/components/ui/SectionLabel";
import ZoomableImage from "@/components/ui/ZoomableImage";
import type { Locale } from "@/i18n/config";

type Dict = {
  label: string;
  title: string;
  body: string;
  points: string[];
  imgAlt: string;
  imgZoom: string;
};

export default function AboutSection({
  dict,
  lang,
}: {
  dict: Dict;
  lang: Locale;
}) {
  return (
    <section
      id="about"
      className="section-pad relative flex min-h-[140vh] flex-col justify-center py-24"
      data-band="about"
    >
      <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-16">
        <div className="max-w-2xl">
          <SectionLabel>{dict.label}</SectionLabel>
          <h2
            className="display mt-6 text-4xl sm:text-6xl lg:text-7xl"
            data-reveal="left"
          >
            {dict.title}
          </h2>
          <p
            className="mt-8 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
            data-reveal="left"
          >
            {dict.body}
          </p>
          <ul className="mt-10 flex flex-col gap-3">
            {dict.points.map((point) => (
              <li
                key={point}
                className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.2em] text-paper/80"
                data-reveal="left"
              >
                <span className="h-1.5 w-1.5 bg-accent" aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <figure className="border border-line bg-ink" data-reveal="right">
          <ZoomableImage
            src={`/assets/web_images/studio.${lang}.webp`}
            alt={dict.imgAlt}
            width={1672}
            height={941}
            sizes="(min-width: 1024px) 45vw, 100vw"
            zoomLabel={dict.imgZoom}
          />
        </figure>
      </div>
    </section>
  );
}
