import type { MetadataRoute } from "next";
import { AGENCY } from "@/data/agency";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${AGENCY.url}/sitemap.xml`,
  };
}
