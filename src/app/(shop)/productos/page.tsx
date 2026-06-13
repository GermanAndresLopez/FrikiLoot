import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { productRepository } from "@/repositories/productRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { PAGE_SIZE } from "@/lib/constants";
import type { CatalogFilters as Filters } from "@/types/domain";
import { ProductCard } from "@/features/catalog/ProductCard";
import { CatalogFilters } from "@/features/catalog/CatalogFilters";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Explora todos nuestros productos de anime.",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | undefined>>;

export default async function ProductosPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const filters: Filters = {
    q: sp.q,
    category: sp.category,
    availability: sp.availability === "in_stock" ? "in_stock" : "all",
    sort: (sp.sort as Filters["sort"]) ?? "recientes",
    page: sp.page ? Number(sp.page) : 1,
  };

  const db = await createClient();
  const [{ items, total }, categories] = await Promise.all([
    productRepository.listCatalog(db, filters),
    categoryRepository.listActive(db),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = filters.page ?? 1;

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category) params.set("category", filters.category);
    if (filters.availability === "in_stock") params.set("availability", "in_stock");
    if (filters.sort && filters.sort !== "recientes") params.set("sort", filters.sort);
    if (p > 1) params.set("page", String(p));
    return `/productos${params.toString() ? `?${params}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold">
          {filters.q ? `Resultados: “${filters.q}”` : "Catálogo"}
        </h1>
        <span className="text-sm text-muted">{total} productos</span>
      </div>

      <CatalogFilters categories={categories} />

      {items.length === 0 ? (
        <p className="py-16 text-center text-muted">No se encontraron productos.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 pt-4">
          {page > 1 && (
            <Link href={buildPageUrl(page - 1)} className="rounded-lg border border-border px-4 py-2 text-sm">
              ← Anterior
            </Link>
          )}
          <span className="text-sm text-muted">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildPageUrl(page + 1)} className="rounded-lg border border-border px-4 py-2 text-sm">
              Siguiente →
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
