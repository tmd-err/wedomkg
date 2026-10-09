import type { Metadata } from "next";
import { lang } from "next/root-params";
import { getDictionary } from "@/i18n/dictionaries";
import { hasLocale, type Locale } from "@/i18n/config";
import { AGENCY } from "@/data/agency";
import Experience from "@/components/Experience";
import HeroSection from "@/components/sections/HeroSection";
import IntroSection from "@/components/sections/IntroSection";
import AboutSection from "@/components/sections/AboutSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ProcessSection from "@/components/sections/ProcessSection";
import WorksSection from "@/components/sections/WorksSection";
import TrustSection from "@/components/sections/TrustSection";
import IndustriesSection from "@/components/sections/IndustriesSection";
import ContactSection from "@/components/sections/ContactSection";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang: l } = await params;
  const locale = hasLocale(l) ? l : "en";
  const dict = await getDictionary(locale);
  const ogLocale = locale === "fr" ? "fr_FR" : "en_US";

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", fr: "/fr" },
    },
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${locale}`,
      siteName: AGENCY.name,
      locale: ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
  };
}

export default async function Page() {
  const locale = await lang();
  const dict = await getDictionary(locale);
  const l: Locale = locale === "fr" ? "fr" : "en";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: AGENCY.name,
    url: AGENCY.url,
    email: AGENCY.email,
    slogan: "We grow together.",
  };

  return (
    <main id="content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Experience preloader={dict.preloader}>
        <HeroSection dict={dict.hero} />
        <IntroSection dict={dict.intro} lang={l} />
        <AboutSection dict={dict.about} lang={l} />
        <ServicesSection dict={dict.services} lang={l} />
        <ProcessSection dict={dict.process} />
        <WorksSection dict={dict.works} locale={locale} />
        <TrustSection dict={dict.trust} />
        <IndustriesSection dict={dict.industries} />
        <ContactSection dict={dict.contact} email={AGENCY.email} />
      </Experience>
    </main>
  );
}
