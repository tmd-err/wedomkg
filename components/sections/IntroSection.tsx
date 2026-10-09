import SectionLabel from "@/components/ui/SectionLabel";
import ZoomableImage from "@/components/ui/ZoomableImage";
import type { Locale } from "@/i18n/config";

type Dict = {
  label: string;
  title: string;
  body: string;
  imgAlt: string;
  imgZoom: string;
};

export default function IntroSection({
  dict,
  lang,
}: {
  dict: Dict;
  lang: Locale;
}) {
  return (
    <section
      className="section-pad relative flex min-h-[130vh] flex-col justify-center py-24"
      data-band="intro"
    >
      <div className="grid items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-16">
        <figure
          className="order-2 border border-line bg-ink lg:order-1"
          data-reveal="left"
        >
          <ZoomableImage
            src={`/assets/web_images/ascent.${lang}.webp`}
            alt={dict.imgAlt}
            width={1672}
            height={941}
            sizes="(min-width: 1024px) 45vw, 100vw"
            zoomLabel={dict.imgZoom}
          />
        </figure>
        <div className="order-1 max-w-2xl text-left sm:text-right lg:order-2 lg:ml-auto">
          <SectionLabel>{dict.label}</SectionLabel>
          <h2
            className="display mt-6 text-4xl sm:text-6xl lg:text-7xl"
            data-reveal="right"
          >
            {dict.title}
          </h2>
          <p
            className="mt-8 max-w-xl text-base leading-relaxed text-mist sm:ml-auto sm:text-lg"
            data-reveal="right"
          >
            {dict.body}
          </p>
        </div>
      </div>
    </section>
  );
}
