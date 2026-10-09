import type { MetadataRoute } from "next";
import { AGENCY } from "@/data/agency";
import { locales } from "@/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: `${AGENCY.url}/${locale}`,
    changeFrequency: "monthly",
    priority: locale === "en" ? 1 : 0.9,
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, `${AGENCY.url}/${l}`])),
    },
  }));
}
