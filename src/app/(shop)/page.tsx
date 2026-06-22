import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { productRepository } from "@/repositories/productRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { getHero } from "@/services/heroService";
import { ProductCard } from "@/features/catalog/ProductCard";
import { HeroView } from "@/features/home/HeroView";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/Motion";

export const revalidate = 120; // ISR: revalida cada 2 min

export default async function HomePage() {
  const db = await createClient();
  const [featured, categories, hero] = await Promise.all([
    productRepository.listFeatured(db, 8),
    categoryRepository.listActive(db),
    getHero(),
  ]);

  return (
    <div className="space-y-14">
      {/* ───────── Hero (editable desde Apariencia) ───────── */}
      <Reveal as="section">
        <HeroView config={hero} />
      </Reveal>

      {/* ───────── Categorías ───────── */}
      {categories.length > 0 && (
        <Reveal as="section">
          <h2 className="mb-4 text-lg font-bold">Explora por categoría</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/productos?category=${c.slug}`}
                className="group shrink-0 rounded-2xl border border-border bg-surface px-5 py-3 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      {/* ───────── Destacados ───────── */}
      <section id="destacados" className="scroll-mt-24">
        <Reveal className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Destacados ✨</h2>
          <Link
            href="/productos"
            className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            Ver todo →
          </Link>
        </Reveal>

        {featured.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
            Aún no hay productos destacados.
          </p>
        ) : (
          <StaggerGrid className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <StaggerItem key={p.id}>
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </section>
    </div>
  );
}
