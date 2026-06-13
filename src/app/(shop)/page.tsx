import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { productRepository } from "@/repositories/productRepository";
import { categoryRepository } from "@/repositories/categoryRepository";
import { env } from "@/lib/env";
import { ProductCard } from "@/features/catalog/ProductCard";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/Motion";

export const revalidate = 120; // ISR: revalida cada 2 min

export default async function HomePage() {
  const db = await createClient();
  const [featured, categories] = await Promise.all([
    productRepository.listFeatured(db, 8),
    categoryRepository.listActive(db),
  ]);

  return (
    <div className="space-y-14">
      {/* ───────── Hero ───────── */}
      <Reveal as="section" className="relative overflow-hidden rounded-[1.75rem] border border-border/60">
        {/* Glows de fondo */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-accent-2/30 blur-3xl" />

        <div className="relative flex flex-col items-center gap-5 bg-surface/40 px-6 py-12 text-center backdrop-blur-sm sm:py-16">
          <Image
            src="/logo.jpg"
            alt={env.storeName}
            width={72}
            height={72}
            priority
            className="h-[72px] w-[72px] rounded-2xl bg-white shadow-xl shadow-primary/20"
          />
          <div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-5xl">
              Tu universo <span className="text-brand-gradient">anime</span>
              <br />en un solo lugar
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-muted sm:text-base">
              Suéteres, figuras, pines y más merch. Pide fácil por WhatsApp.
            </p>
          </div>

          {/* Dos opciones */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/productos"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/40 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              Ver catálogo
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="#destacados"
              className="inline-flex h-12 items-center rounded-xl border border-border bg-surface/60 px-7 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Ver destacados
            </Link>
          </div>
        </div>
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
