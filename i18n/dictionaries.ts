import { hasLocale, defaultLocale } from "./config";
import type en from "./en.json";

export type Dictionary = typeof en;

const dictionaries = {
  en: () => import("./en.json").then((m) => m.default),
  fr: () => import("./fr.json").then((m) => m.default),
};

export const getDictionary = async (
  locale: string,
): Promise<Dictionary> =>
  dictionaries[hasLocale(locale) ? locale : defaultLocale]();
