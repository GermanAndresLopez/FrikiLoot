import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { productRepository } from "@/repositories/productRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { env } from "@/lib/env";
import { ProductCard } from "@/features/catalog/ProductCard";
import { Button } from "@/components/ui/Button";

export const revalidate = 120; // ISR: revalida cada 2 min

export default async function HomePage() {
  const db = await createClient();
  const [featured, categories] = await Promise.all([
    productRepository.listFeatured(db, 8),
    categoryRepository.listActive(db),
  ]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="overflow-hidden rounded-card bg-brand-gradient p-6 sm:p-10">
        <h1 className="text-2xl font-extrabold text-white sm:text-4xl">
          Tu universo anime,<br />en un solo lugar
        </h1>
        <p className="mt-2 max-w-md text-sm text-white/90">
          Suéteres, figuras, pines y más. Haz tu pedido fácil por WhatsApp.
        </p>
        <Link href="/productos" className="mt-5 inline-block">
          <Button variant="secondary">Ver catálogo</Button>
        </Link>
      </section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">Categorías</h2>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/productos?category=${c.slug}`}
                className="shrink-0 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Destacados</h2>
          <Link href="/productos" className="text-sm text-primary">
            Ver todo →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-sm text-muted">Aún no hay productos destacados.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-xs text-muted">
        {env.storeName} · Pedidos por WhatsApp
      </p>
    </div>
  );
}
