/** Sistema de tema: tokens de color global, presets y generación de CSS. */

export type ThemeMode = "dark" | "light";

export interface Theme {
  mode: ThemeMode;
  bg: string;
  surface: string;
  surface2: string;
  border: string;
  foreground: string;
  muted: string;
  primary: string;
  primaryHover: string;
  accent: string;
  accent2: string;
  success: string;
  warning: string;
  danger: string;
}

/** Tokens editables (clave → etiqueta + variable CSS). */
export const THEME_TOKENS: { key: keyof Omit<Theme, "mode">; label: string; cssVar: string }[] = [
  { key: "primary", label: "Primario", cssVar: "--color-primary" },
  { key: "primaryHover", label: "Primario (hover)", cssVar: "--color-primary-hover" },
  { key: "accent", label: "Acento", cssVar: "--color-accent" },
  { key: "accent2", label: "Acento 2", cssVar: "--color-accent-2" },
  { key: "bg", label: "Fondo", cssVar: "--color-bg" },
  { key: "surface", label: "Superficie", cssVar: "--color-surface" },
  { key: "surface2", label: "Superficie 2", cssVar: "--color-surface-2" },
  { key: "border", label: "Bordes", cssVar: "--color-border" },
  { key: "foreground", label: "Texto", cssVar: "--color-foreground" },
  { key: "muted", label: "Texto tenue", cssVar: "--color-muted" },
  { key: "success", label: "Éxito", cssVar: "--color-success" },
  { key: "warning", label: "Advertencia", cssVar: "--color-warning" },
  { key: "danger", label: "Peligro", cssVar: "--color-danger" },
];

/** Preset oscuro de marca (el original). También es el fallback. */
export const DEFAULT_THEME: Theme = {
  mode: "dark",
  bg: "#0a0a0f",
  surface: "#13131c",
  surface2: "#1c1c2a",
  border: "#2a2a3d",
  foreground: "#ededf2",
  muted: "#9a9ab0",
  primary: "#ff3d7f",
  primaryHover: "#ff5c93",
  accent: "#22d3ee",
  accent2: "#a855f7",
  success: "#34d399",
  warning: "#fbbf24",
  danger: "#f43f5e",
};

export const DARK_THEME: Theme = { ...DEFAULT_THEME };

export const LIGHT_THEME: Theme = {
  mode: "light",
  bg: "#f6f6fb",
  surface: "#ffffff",
  surface2: "#eeeef4",
  border: "#e0e0ea",
  foreground: "#16161f",
  muted: "#6b6b80",
  primary: "#e5306f",
  primaryHover: "#ff3d7f",
  accent: "#0891b2",
  accent2: "#9333ea",
  success: "#059669",
  warning: "#d97706",
  danger: "#e11d48",
};

export const PRESETS: { id: string; label: string; theme: Theme }[] = [
  { id: "default", label: "Predeterminado", theme: DEFAULT_THEME },
  { id: "dark", label: "Modo oscuro", theme: DARK_THEME },
  { id: "light", label: "Modo claro", theme: LIGHT_THEME },
];

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Fusiona datos parciales (jsonb) con el preset por defecto, validando hex. */
export function normalizeTheme(raw: unknown): Theme {
  const data = (raw ?? {}) as Partial<Record<keyof Theme, unknown>>;
  const out: Theme = { ...DEFAULT_THEME };
  for (const { key } of THEME_TOKENS) {
    const v = data[key];
    if (typeof v === "string" && HEX.test(v)) out[key] = v;
  }
  out.mode = data.mode === "light" ? "light" : "dark";
  return out;
}

/**
 * Genera el bloque CSS que sobreescribe las variables del tema.
 * Usa `:root:root` (mayor especificidad) para ganar siempre sobre el @theme base.
 */
export function themeToCss(t: Theme): string {
  const vars = THEME_TOKENS.map(({ key, cssVar }) => `${cssVar}:${t[key]}`).join(";");
  return `:root:root{color-scheme:${t.mode};${vars}}`;
}
