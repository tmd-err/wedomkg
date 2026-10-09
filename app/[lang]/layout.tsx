import type { Metadata } from "next";
import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { hasLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AGENCY } from "@/data/agency";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(AGENCY.url),
};

export async function generateStaticParams() {
  return locales.map((l) => ({ lang: l }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await lang();
  if (!hasLocale(locale)) notFound();
  const dict = await getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${archivo.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-ink text-paper">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-ink"
        >
          {locale === "fr" ? "Aller au contenu" : "Skip to content"}
        </a>
        <Header locale={locale} nav={dict.nav} languageLabel={dict.language.label} cta={dict.nav.cta} />
        {children}
        <Footer locale={locale} dict={dict.footer} nav={dict.nav} />
      </body>
    </html>
  );
}
