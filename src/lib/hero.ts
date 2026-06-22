/** Configuración editable de la portada (hero) del inicio. */

export interface HeroConfig {
  title: string;
  subtitle: string;
  titleGradient: boolean;
  titleColor: string;
  subtitleColor: string;
  backgroundImage: string;
  backgroundOpacity: number;
}

const HEX = /^#[0-9a-fA-F]{6}$/;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const DEFAULT_HERO: HeroConfig = {
  title: "Tu universo anime en un solo lugar",
  subtitle: "Suéteres, figuras, pines y más merch. Pide fácil por WhatsApp.",
  titleGradient: false,
  titleColor: "#ededf2",
  subtitleColor: "#9a9ab0",
  backgroundImage: "",
  backgroundOpacity: 0.35,
};

export function normalizeHero(raw: unknown): HeroConfig {
  const d = (raw ?? {}) as Partial<HeroConfig>;

  // Migrate old `images` array → first image as backgroundImage
  const legacyImages = (d as Record<string, unknown>).images;
  const fallbackBg =
    Array.isArray(legacyImages) && typeof legacyImages[0] === "string" ? legacyImages[0] : "";

  return {
    title: typeof d.title === "string" ? d.title : DEFAULT_HERO.title,
    subtitle: typeof d.subtitle === "string" ? d.subtitle : DEFAULT_HERO.subtitle,
    titleGradient: Boolean(d.titleGradient),
    titleColor: typeof d.titleColor === "string" && HEX.test(d.titleColor) ? d.titleColor : DEFAULT_HERO.titleColor,
    subtitleColor:
      typeof d.subtitleColor === "string" && HEX.test(d.subtitleColor) ? d.subtitleColor : DEFAULT_HERO.subtitleColor,
    backgroundImage: typeof d.backgroundImage === "string" ? d.backgroundImage : fallbackBg,
    backgroundOpacity: typeof d.backgroundOpacity === "number" ? clamp01(d.backgroundOpacity) : DEFAULT_HERO.backgroundOpacity,
  };
}
