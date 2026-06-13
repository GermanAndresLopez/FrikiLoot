import { createClient } from "@/lib/supabase/server";
import { metricsRepository } from "@/repositories/metricsRepository";
import { env } from "@/lib/env";
import { formatCOP } from "@/lib/format";
import { StatCard } from "@/features/admin/StatCard";
import { TopProductsCard } from "@/features/admin/TopProductsCard";
import { FunnelCard } from "@/features/admin/FunnelCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = await createClient();

  const [summary, sales, topViews, topCart, topWa, funnel] = await Promise.all([
    metricsRepository.summary(db, env.lowStockThreshold),
    metricsRepository.salesSummary(db),
    metricsRepository.topProducts(db, "views"),
    metricsRepository.topProducts(db, "cart_adds"),
    metricsRepository.topProducts(db, "whatsapp_sends"),
    metricsRepository.funnel(db),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Panel</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Resumen de tu tienda en tiempo real.</p>
      </header>

      {/* Ventas e ingresos (pedidos confirmados) */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Ventas e ingresos</h2>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Ingresos totales" value={formatCOP(sales.revenue)} tone="accent" />
          <StatCard label="Ventas realizadas" value={sales.salesCount} tone="accent" />
          <StatCard label="Ingresos del mes" value={formatCOP(sales.revenueMonth)} />
          <StatCard label="Ventas del mes" value={sales.salesMonth} />
        </div>
        <p className="mt-2 text-xs text-muted">
          Calculado sobre pedidos confirmados como “Compra realizada”.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="Productos" value={summary.totalProducts} />
        <StatCard label="Categorías" value={summary.totalCategories} />
        <StatCard label="Agotados" value={summary.outOfStock} tone={summary.outOfStock ? "danger" : "default"} />
        <StatCard label="Stock bajo" value={summary.lowStock} tone={summary.lowStock ? "warning" : "default"} />
        <StatCard label="Visitas hoy" value={summary.visitsToday} tone="accent" />
        <StatCard label="Visitas mes" value={summary.visitsMonth} tone="accent" />
      </section>

      <FunnelCard funnel={funnel} />

      <section className="grid gap-4 lg:grid-cols-3">
        <TopProductsCard title="Más vistos" metric="views" items={topViews} />
        <TopProductsCard title="Más agregados al carrito" metric="cart_adds" items={topCart} />
        <TopProductsCard title="Más enviados por WhatsApp" metric="whatsapp_sends" items={topWa} />
      </section>
    </div>
  );
}
