import Link from "next/link";
import Image from "next/image";
import type { ProductCard as ProductCardType } from "@/types/domain";
import { formatCOP } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export function ProductCard({ product }: { product: ProductCardType }) {
  const agotado = product.effective_stock === 0;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-transform active:scale-[0.98]"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        {product.primary_image ? (
          <Image
            src={product.primary_image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-muted">🎴</div>
        )}
        {product.is_featured && (
          <Badge tone="primary" className="absolute left-2 top-2">
            Destacado
          </Badge>
        )}
        {agotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Badge tone="danger">Agotado</Badge>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category && <p className="text-[11px] text-muted">{product.category.name}</p>}
        <h3 className="line-clamp-2 text-sm font-medium leading-tight">{product.name}</h3>
        <p className="mt-auto pt-1 font-bold text-primary">{formatCOP(product.price)}</p>
      </div>
    </Link>
  );
}
