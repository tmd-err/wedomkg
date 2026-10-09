import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales } from "./i18n/config";

function getPreferredLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language") ?? "";
  const choices = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of choices) {
    const base = tag.split("-")[0];
    if ((locales as readonly string[]).includes(base)) return base;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (pathnameHasLocale) return;

  const locale = getPreferredLocale(request);
  request.nextUrl.pathname =
    `/${locale}` + (pathname === "/" ? "" : pathname);
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip internal paths, files with extensions (assets, sitemap.xml, robots.txt…)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
