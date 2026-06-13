import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { productRepository } from "@/repositories/productRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { env } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/productos`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const db = await createClient();
    const [products, categories] = await Promise.all([
      productRepository.listActiveSlugs(db),
      categoryRepository.listActive(db),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${base}/producto/${p.slug}`,
      lastModified: p.updated_at,
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${base}/productos?category=${c.slug}`,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes];
  } catch {
    // Si la BD no está disponible (build sin env), al menos las rutas estáticas.
    return staticRoutes;
  }
}
