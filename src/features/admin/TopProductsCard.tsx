import Link from "next/link";
import type { ProductMetric } from "@/types/domain";

const metricLabel = {
  views: "vistas",
  cart_adds: "al carrito",
  whatsapp_sends: "pedidos",
} as const;

export function TopProductsCard({
  title,
  metric,
  items,
}: {
  title: string;
  metric: keyof typeof metricLabel;
  items: ProductMetric[];
}) {
  const withData = items.filter((i) => i[metric] > 0);

  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {withData.length === 0 ? (
        <p className="text-xs text-muted">Sin datos todavía.</p>
      ) : (
        <ol className="space-y-2">
          {withData.map((p, i) => (
            <li key={p.product_id} className="flex items-center justify-between gap-2 text-sm">
              <Link href={`/producto/${p.slug}`} className="flex min-w-0 items-center gap-2 hover:text-primary">
                <span className="text-xs text-muted">{i + 1}.</span>
                <span className="truncate">{p.name}</span>
              </Link>
              <span className="shrink-0 text-xs text-muted">
                {p[metric]} {metricLabel[metric]}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
