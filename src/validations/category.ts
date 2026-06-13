import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(60),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  description: z.string().max(300).optional().or(z.literal("")),
  image_url: z.string().url("URL inválida").optional().or(z.literal("")),
  is_active: z.boolean().default(true),
  display_order: z.coerce.number().int().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;
