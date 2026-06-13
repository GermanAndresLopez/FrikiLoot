import { z } from "zod";
import { SIZES } from "@/lib/constants";

export const sizeStockSchema = z.object({
  size: z.enum(SIZES),
  stock: z.coerce.number().int().min(0),
});

export const productSchema = z
  .object({
    name: z.string().min(2, "Mínimo 2 caracteres").max(120),
    slug: z
      .string()
      .min(2)
      .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
    description: z.string().max(2000).optional().or(z.literal("")),
    category_id: z.string().uuid("Selecciona una categoría").nullable(),
    price: z.coerce.number().int("Sin decimales (COP)").min(0, "Precio inválido"),
    stock: z.coerce.number().int().min(0).default(0),
    has_sizes: z.boolean().default(false),
    is_featured: z.boolean().default(false),
    is_active: z.boolean().default(true),
    sizes: z.array(sizeStockSchema).default([]),
  })
  .refine((d) => !d.has_sizes || d.sizes.length > 0, {
    message: "Agrega al menos una talla con stock",
    path: ["sizes"],
  });

export type ProductInput = z.infer<typeof productSchema>;

/** Ajuste de inventario desde el módulo de inventario. */
export const stockAdjustSchema = z.object({
  product_id: z.string().uuid(),
  size: z.enum(SIZES).nullable().optional(),
  delta: z.coerce.number().int(),
});

export type StockAdjustInput = z.infer<typeof stockAdjustSchema>;
