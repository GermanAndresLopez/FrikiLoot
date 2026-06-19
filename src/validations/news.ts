import { z } from "zod";

export const newsSchema = z
  .object({
    title: z.string().max(120).optional().or(z.literal("")),
    description: z.string().max(2000).optional().or(z.literal("")),
    image_url: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
    is_active: z.boolean().default(true),
    // Fecha de finalización (YYYY-MM-DD) o vacío = indefinida.
    ends_at: z.string().optional().or(z.literal("")),
  })
  .refine((d) => (d.title && d.title.trim()) || (d.image_url && d.image_url.trim()), {
    message: "Agrega al menos un título o una imagen.",
    path: ["title"],
  });

export type NewsInput = z.infer<typeof newsSchema>;
