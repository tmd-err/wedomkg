export const locales = ["en", "fr"] as const;
export const defaultLocale = "en" as const;
export type Locale = (typeof locales)[number];

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale);
