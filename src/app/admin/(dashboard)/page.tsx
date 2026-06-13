import { createClient } from "@/lib/supabase/server";
import { metricsRepository } from "@/repositories/metricsRepository";
import { env } from "@/lib/env";
import { StatCard } from "@/features/admin/StatCard";
import { TopProductsCard } from "@/features/admin/TopProductsCard";
import { FunnelCard } from "@/features/admin/FunnelCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const db = await createClient();

  const [summary, topViews, topCart, topWa, funnel] = await Promise.all([
    metricsRepository.summary(db, env.lowStockThreshold),
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
