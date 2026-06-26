import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notificationRepository } from "@/repositories/notificationRepository";
import { adminProductRepository } from "@/repositories/adminProductRepository";
import { orderRepository } from "@/repositories/orderRepository";
import { formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OrderCard } from "@/features/admin/OrderCard";
import { markNotificationReadAction, markAllReadAction } from "@/actions/notifications";
import type { NotificationType } from "@/types/database";

export const dynamic = "force-dynamic";

const toneByType: Record<NotificationType, "danger" | "warning" | "primary" | "accent" | "success"> = {
  agotado: "danger",
  stock_bajo: "warning",
  producto_popular: "primary",
  incremento_visitas: "accent",
  nuevo_pedido: "success",
};

const labelByType: Record<NotificationType, string> = {
  agotado: "Agotado",
  stock_bajo: "Stock bajo",
  producto_popular: "Popular",
  incremento_visitas: "Visitas",
  nuevo_pedido: "Pedido",
};

export default async function AlertasPage() {
  const db = await createClient();
  const [notifications, inventory, orders, products] = await Promise.all([
    notificationRepository.list(db),
    adminProductRepository.listInventory(db),
    orderRepository.listPending(db, 50),
    adminProductRepository.listBasic(db),
  ]);

  const outOfStock = inventory.filter((i) => i.stock === 0);
  const lowStock = inventory.filter((i) => i.stock > 0 && i.stock <= i.low_stock_threshold);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Centro de</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Alertas</h1>
        <p className="mt-1 text-sm text-muted">Estado de stock en vivo y notificaciones de la tienda.</p>
      </header>

      {/* ───────── Alertas de stock en vivo ───────── */}
      <section className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <StockAlertCard
            title="Agotados"
            tone="danger"
            items={outOfStock.map((i) => ({ id: i.id, name: i.name, detail: "0 uds" }))}
          />
          <StockAlertCard
            title="Stock bajo"
            tone="warning"
            items={lowStock.map((i) => ({
              id: i.id,
              name: i.name,
              detail: `${i.stock} ≤ ${i.low_stock_threshold}`,
            }))}
          />
        </div>
      </section>

      {/* ───────── Pedidos por confirmar ───────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Pedidos por confirmar</h2>
          {orders.length > 0 && <Badge tone="warning">{orders.length}</Badge>}
        </div>
        {orders.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            No hay pedidos pendientes. Los confirmados salen de esta lista. ✓
          </p>
        ) : (
          <ul className="space-y-2.5">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} products={products} />
            ))}
          </ul>
        )}
      </section>

      {/* ───────── Notificaciones ───────── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Notificaciones</h2>
          {notifications.length > 0 && (
            <form action={markAllReadAction}>
              <Button size="sm" variant="secondary">Limpiar todo</Button>
            </form>
          )}
        </div>

        <ul className="space-y-2">
          {notifications.length === 0 && (
            <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Sin notificaciones.
            </li>
          )}
          {notifications.map((n) => (
            <li
              key={n.id}
              className="rounded-2xl border border-primary/40 bg-surface-2 p-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium">
                    <Badge tone={toneByType[n.type]}>{labelByType[n.type]}</Badge>
                    <span className="truncate">{n.title}</span>
                  </p>
                  {n.description && <p className="mt-0.5 text-sm text-muted">{n.description}</p>}
                  <p className="mt-1 text-xs text-muted">{formatRelative(n.created_at)}</p>
                </div>
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button size="sm" variant="ghost" type="submit">
                    Quitar
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function StockAlertCard({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "danger" | "warning";
  items: { id: string; name: string; detail: string }[];
}) {
  return (
    <div
      className={`rounded-2xl border bg-surface p-4 ${tone === "danger" ? "border-danger/40" : "border-warning/40"}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Badge tone={tone}>{items.length}</Badge>
          {title}
        </h3>
        {items.length > 0 && (
          <Link href="/admin/inventario" className="text-xs text-primary hover:opacity-80">
            Gestionar →
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-muted">Todo en orden ✓</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 6).map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2 text-sm">
              <Link href="/admin/inventario" className="truncate hover:text-primary">
                {i.name}
              </Link>
              <span className="shrink-0 text-xs text-muted">{i.detail}</span>
            </li>
          ))}
          {items.length > 6 && <li className="text-xs text-muted">+{items.length - 6} más…</li>}
        </ul>
      )}
    </div>
  );
}
