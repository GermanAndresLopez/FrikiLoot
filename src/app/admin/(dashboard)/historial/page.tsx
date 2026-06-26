import { createClient } from "@/lib/supabase/server";
import { orderRepository } from "@/repositories/orderRepository";
import { formatCOP, formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import type { OrderItemSnapshot } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
  const db = await createClient();
  const orders = await orderRepository.listResolved(db, 100);

  const completed = orders.filter((o) => o.status === "completed");
  const cancelled = orders.filter((o) => o.status === "cancelled");

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Registro</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Historial de compras</h1>
        <p className="mt-1 text-sm text-muted">
          {completed.length} realizada(s) · {cancelled.length} cancelada(s)
        </p>
      </header>

      {orders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No hay compras registradas aún.
        </p>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => {
            const items = o.items as OrderItemSnapshot[];
            const isCompleted = o.status === "completed";
            return (
              <li
                key={o.id}
                className={`rounded-2xl border p-4 ${
                  isCompleted ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge tone={isCompleted ? "success" : "danger"}>
                        {isCompleted ? "Realizada" : "Cancelada"}
                      </Badge>
                      <span className="text-xs text-muted">{formatRelative(o.created_at)}</span>
                    </div>

                    {o.customer_name && (
                      <p className="mt-1.5 text-sm font-medium">{o.customer_name}</p>
                    )}

                    <ul className="mt-2 space-y-0.5">
                      {items.map((item, i) => (
                        <li key={i} className="text-sm text-muted">
                          {item.quantity}× {item.name}
                          {item.size && <span className="text-xs"> ({item.size})</span>}
                          {" — "}
                          <span className="text-foreground">{formatCOP(item.unit_price * item.quantity)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold">{formatCOP(o.total)}</p>
                    {isCompleted && o.stock_applied && (
                      <p className="text-[10px] text-success">Stock descontado</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
