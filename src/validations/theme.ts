import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hex inválido");

export const themeSchema = z.object({
  mode: z.enum(["dark", "light"]),
  bg: hex,
  surface: hex,
  surface2: hex,
  border: hex,
  foreground: hex,
  muted: hex,
  primary: hex,
  primaryHover: hex,
  accent: hex,
  accent2: hex,
  success: hex,
  warning: hex,
  danger: hex,
});

export type ThemeInput = z.infer<typeof themeSchema>;
