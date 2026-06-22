import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hex inválido");

export const heroSchema = z.object({
  title: z.string().max(120),
  subtitle: z.string().max(300),
  titleGradient: z.boolean(),
  titleColor: hex,
  subtitleColor: hex,
  images: z.array(z.string().url()).max(6),
});

export type HeroInput = z.infer<typeof heroSchema>;
