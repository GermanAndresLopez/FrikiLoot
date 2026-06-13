import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { productRepository } from "@/repositories/productRepository";
import { formatCOP } from "@/lib/format";
import { env } from "@/lib/env";
import { truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Gallery } from "@/features/catalog/Gallery";
import { AddToCartPanel } from "@/features/catalog/AddToCartPanel";
import { ViewTracker } from "@/features/catalog/ViewTracker";
import { ProductCard } from "@/features/catalog/ProductCard";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const db = await createClient();
  const product = await productRepository.getDetailBySlug(db, slug);
  if (!product) return { title: "Producto no encontrado" };

  const description = product.description
    ? truncate(product.description, 160)
    : `${product.name} disponible en ${env.storeName}.`;
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      images: image ? [{ url: image }] : undefined,
    },
  };
}

export default async function ProductoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await createClient();
  const product = await productRepository.getDetailBySlug(db, slug);
  if (!product) notFound();

  const related = await productRepository.listRelated(db, product.category_id, product.id);

  // JSON-LD para SEO de producto
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.map((i) => i.url),
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "COP",
      price: product.price,
      availability:
        product.effective_stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="space-y-10">
      <ViewTracker productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-6 md:grid-cols-2">
        <Gallery images={product.images} alt={product.name} />

        <div className="space-y-5">
          <div>
            {product.category && <Badge tone="accent">{product.category.name}</Badge>}
            <h1 className="mt-2 text-2xl font-bold">{product.name}</h1>
            <p className="mt-1 text-2xl font-extrabold text-primary">{formatCOP(product.price)}</p>
          </div>

          {product.description && (
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{product.description}</p>
          )}

          <AddToCartPanel product={product} />
        </div>
      </div>

      {related.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-bold">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
