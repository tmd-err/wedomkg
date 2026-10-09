import { Globe, Share2, Sparkles, Target } from "lucide-react";
import SectionLabel from "@/components/ui/SectionLabel";
import ZoomableImage from "@/components/ui/ZoomableImage";
import type { Locale } from "@/i18n/config";

type Service = {
  id: string;
  title: string;
  desc: string;
  tags: string[];
  imgAlt: string;
};

const SERVICE_ICONS = {
  social: Share2,
  web: Globe,
  ads: Target,
  influence: Sparkles,
} as const;

const SERVICE_IMAGES = {
  social: "svc-social",
  web: "svc-web",
  ads: "svc-ads",
  influence: "svc-influence",
} as const;

type Dict = {
  label: string;
  title: string;
  intro: string;
  imgAlt: string;
  imgZoom: string;
  items: Service[];
};

export default function ServicesSection({
  dict,
  lang,
}: {
  dict: Dict;
  lang: Locale;
}) {
  return (
    <section
      id="services"
      className="section-pad relative py-28"
      data-band="services"
      style={{ minHeight: "300vh" }}
    >
      <div className="mb-24 grid items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-16">
        <figure className="order-2 border border-line bg-ink lg:order-1" data-reveal="left">
          <ZoomableImage
            src={`/assets/web_images/services-diagram.${lang}.webp`}
            alt={dict.imgAlt}
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 45vw, 100vw"
            zoomLabel={dict.imgZoom}
          />
        </figure>
        <div className="order-1 max-w-3xl lg:order-2">
          <SectionLabel>{dict.label}</SectionLabel>
          <h2 className="display mt-6 text-4xl sm:text-6xl lg:text-7xl" data-reveal="right">
            {dict.title}
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-mist sm:text-lg" data-reveal="right">
            {dict.intro}
          </p>
        </div>
      </div>

      <ol className="flex flex-col gap-[28vh]" data-focus="services">
        {dict.items.map((service, i) => {
          const Icon =
            SERVICE_ICONS[service.id as keyof typeof SERVICE_ICONS] ?? Sparkles;
          const img = SERVICE_IMAGES[service.id as keyof typeof SERVICE_IMAGES];
          return (
          <li
            key={service.id}
            data-focus-row
            className="grid items-center gap-10 sm:grid-cols-2 sm:gap-14 lg:gap-16"
          >
            <div
              className={`max-w-xl ${i % 2 === 0 ? "" : "sm:order-2 sm:ml-auto sm:text-right"}`}
              data-reveal={i % 2 === 0 ? "left" : "right"}
            >
              <span className="mb-5 inline-flex h-10 w-10 items-center justify-center border border-line text-accent">
                <Icon size={16} aria-hidden="true" />
              </span>
              <span className="kicker block">
                {String(i + 1).padStart(2, "0")} / {String(dict.items.length).padStart(2, "0")}
              </span>
              <h3 className="display mt-4 text-3xl sm:text-5xl">
                {service.title}
              </h3>
              <p className={`mt-5 max-w-md text-sm leading-relaxed text-mist sm:text-base ${i % 2 === 0 ? "" : "sm:ml-auto"}`}>
                {service.desc}
              </p>
              <ul className={`mt-5 flex flex-wrap gap-2 ${i % 2 === 0 ? "" : "sm:justify-end"}`}>
                {service.tags.map((tag) => (
                  <li
                    key={tag}
                    className="border border-line px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-mist"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            </div>
            {img && (
              <figure
                className={`border border-line bg-ink ${i % 2 === 0 ? "" : "sm:order-1"}`}
                data-reveal={i % 2 === 0 ? "right" : "left"}
              >
                <ZoomableImage
                  src={`/assets/web_images/${img}.${lang}.webp`}
                  alt={service.imgAlt}
                  width={1536}
                  height={1024}
                  sizes="(min-width: 640px) 45vw, 100vw"
                  zoomLabel={dict.imgZoom}
                />
              </figure>
            )}
          </li>
          );
        })}
      </ol>
    </section>
  );
}
