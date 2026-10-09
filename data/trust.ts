export type TrustLogo = {
  id: string;
  name: string;
  image: string;
};

/**
 * White-on-transparent client logos from /public/assets/trust_us_images.
 * Names are derived from the visible mark in each asset.
 */
export const TRUST_LOGOS: TrustLogo[] = [
  { id: "kayser", name: "Maison Kayser", image: "/assets/trust_us_images/kayser.webp" },
  { id: "cartway", name: "Cartway", image: "/assets/trust_us_images/cartway.webp" },
  { id: "dentist", name: "German Syrian Dental Clinic", image: "/assets/trust_us_images/dentist.webp" },
  { id: "graviton", name: "Graviton Solutions", image: "/assets/trust_us_images/graviton.webp" },
  { id: "tracagri", name: "Tracagri", image: "/assets/trust_us_images/tracagri.webp" },
  { id: "sushibox", name: "Sushibox", image: "/assets/trust_us_images/sushi1.webp" },
  { id: "rs", name: "Regard & Silhouette", image: "/assets/trust_us_images/RS.webp" },
  { id: "salon", name: "Ladies Salon & Spa", image: "/assets/trust_us_images/femme1.webp" },
];
