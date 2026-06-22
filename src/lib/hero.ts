/** Configuración editable de la portada (hero) del inicio. */

export interface HeroConfig {
  title: string;
  subtitle: string;
  titleGradient: boolean; // título con gradiente de marca
  titleColor: string; // usado si !titleGradient
  subtitleColor: string;
  images: string[]; // 0..6 imágenes; vacío = muestra el logo
}

const HEX = /^#[0-9a-fA-F]{6}$/;

export const DEFAULT_HERO: HeroConfig = {
  title: "Tu universo anime en un solo lugar",
  subtitle: "Suéteres, figuras, pines y más merch. Pide fácil por WhatsApp.",
  titleGradient: false,
  titleColor: "#ededf2",
  subtitleColor: "#9a9ab0",
  images: [],
};

export function normalizeHero(raw: unknown): HeroConfig {
  const d = (raw ?? {}) as Partial<HeroConfig>;
  return {
    title: typeof d.title === "string" ? d.title : DEFAULT_HERO.title,
    subtitle: typeof d.subtitle === "string" ? d.subtitle : DEFAULT_HERO.subtitle,
    titleGradient: Boolean(d.titleGradient),
    titleColor: typeof d.titleColor === "string" && HEX.test(d.titleColor) ? d.titleColor : DEFAULT_HERO.titleColor,
    subtitleColor:
      typeof d.subtitleColor === "string" && HEX.test(d.subtitleColor) ? d.subtitleColor : DEFAULT_HERO.subtitleColor,
    images: Array.isArray(d.images) ? d.images.filter((x): x is string => typeof x === "string").slice(0, 6) : [],
  };
}
