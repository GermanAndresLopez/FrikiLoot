import { createClient } from "@/lib/supabase/server";
import { adminProductRepository } from "@/repositories/adminProductRepository";
import { metricsRepository } from "@/repositories/metricsRepository";
import { env } from "@/lib/env";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/features/admin/StatCard";
import { StockControl } from "@/features/admin/StockControl";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const db = await createClient();
  const [products, summary] = await Promise.all([
    adminProductRepository.list(db),
    metricsRepository.summary(db, env.lowStockThreshold),
  ]);

  // Ordena: agotados y stock bajo primero
  const sorted = [...products].sort((a, b) => {
    const sa = a.total_size_stock ?? a.stock;
    const sb = b.total_size_stock ?? b.stock;
    return sa - sb;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventario</h1>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Productos" value={summary.totalProducts} />
        <StatCard label="Agotados" value={summary.outOfStock} tone={summary.outOfStock ? "danger" : "default"} />
        <StatCard label="Stock bajo" value={summary.lowStock} tone={summary.lowStock ? "warning" : "default"} />
        <StatCard label="Umbral bajo" value={`≤ ${env.lowStockThreshold}`} />
      </section>

      <ul className="space-y-2">
        {sorted.map((p) => {
          const stock = p.total_size_stock ?? p.stock;
          const tone = stock === 0 ? "danger" : stock <= env.lowStockThreshold ? "warning" : "success";
          return (
            <li key={p.id} className="rounded-xl border border-border bg-surface p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium">{p.name}</p>
                <Badge tone={tone}>
                  {stock === 0 ? "Agotado" : `${stock} uds`}
                </Badge>
              </div>
              {!p.has_sizes && (
                <div className="mt-2">
                  <StockControl productId={p.id} stock={p.stock} />
                </div>
              )}
              {p.has_sizes && (
                <p className="mt-1 text-xs text-muted">
                  Producto con tallas — ajusta el stock por talla desde la edición del producto.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
