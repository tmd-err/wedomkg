export type Project = {
  id: string;
  name: string;
  href: string;
  image: string;
  tag: { en: string; fr: string };
  description: { en: string; fr: string };
};

export const PROJECTS: Project[] = [
  {
    id: "kayser",
    name: "Maison Kayser",
    href: "https://www.maison-kayser.ma/",
    image: "/assets/web_images/kayser.webp",
    tag: { en: "Bakery — Website", fr: "Boulangerie — Site web" },
    description: {
      en: "The Moroccan address of the Parisian artisan bakery.",
      fr: "L'adresse marocaine de la maison de boulangerie parisienne.",
    },
  },
  {
    id: "ophtalmo",
    name: "Centre d'Ophtalmologie Ryad",
    href: "https://www.ophtalmoryad.ma/",
    image: "/assets/web_images/ophtalmo.webp",
    tag: { en: "Ophthalmology — Website", fr: "Ophtalmologie — Site web" },
    description: {
      en: "A specialist eye-care clinic, made easy to find and contact.",
      fr: "Une clinique ophtalmologique, facile à trouver et à contacter.",
    },
  },
  {
    id: "cartway",
    name: "Cartway",
    href: "https://www.cartway.ma/",
    image: "/assets/web_images/cartway.webp",
    tag: { en: "E-commerce — Website", fr: "E-commerce — Site web" },
    description: {
      en: "An online store built for browsing and buying.",
      fr: "Une boutique en ligne pensée pour parcourir et acheter.",
    },
  },
  {
    id: "dentist",
    name: "German Syrian Dental Clinic",
    href: "https://www.gsdentalclinic.ma/",
    image: "/assets/web_images/dentist.webp",
    tag: { en: "Dental clinic — Website", fr: "Clinique dentaire — Site web" },
    description: {
      en: "A dental practice with a clear, reassuring web presence.",
      fr: "Un cabinet dentaire avec une présence web claire et rassurante.",
    },
  },
  {
    id: "dvine",
    name: "Divine Beauty Lounge",
    href: "https://www.dvinebeautelounge.com/",
    image: "/assets/web_images/dvine.webp",
    tag: { en: "Beauty lounge — Website", fr: "Salon de beauté — Site web" },
    description: {
      en: "A beauty lounge with an online presence as polished as the service.",
      fr: "Un salon de beauté avec une présence en ligne aussi soignée que le service.",
    },
  },
  {
    id: "athena",
    name: "Athena Contractors",
    href: "https://athena-contractors.com/",
    image: "/assets/web_images/athena.webp",
    tag: { en: "Contracting — Website", fr: "BTP — Site web" },
    description: {
      en: "A contracting company with a site as solid as its work.",
      fr: "Une entreprise de construction avec un site aussi solide que ses chantiers.",
    },
  },
];
