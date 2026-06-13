"use client";

import { useTransition } from "react";
import type { OrderRow } from "@/repositories/orderRepository";
import { fulfillOrderAction } from "@/actions/orders";
import { formatCOP, formatRelative } from "@/lib/format";
import { toast } from "@/store/toastStore";
import { Badge } from "@/components/ui/Badge";

export function OrderCard({ order }: { order: OrderRow }) {
  const [pending, startTransition] = useTransition();

  function resolve(completed: boolean) {
    startTransition(async () => {
      await fulfillOrderAction(order.id, completed);
      toast.success(
        completed ? "Compra confirmada · stock descontado" : "Pedido marcado como no realizado"
      );
    });
  }

  const borderTone =
    order.status === "completed"
      ? "border-success/40"
      : order.status === "cancelled"
        ? "border-border opacity-70"
        : "border-primary/40";

  return (
    <li className={`rounded-2xl border bg-surface p-4 transition-colors ${borderTone}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            {order.customer_name || "Cliente"}{" "}
            <span className="text-sm font-normal text-muted">· {formatCOP(order.total)}</span>
          </p>
          <p className="text-xs text-muted">
            {order.customer_phone ? `${order.customer_phone} · ` : ""}
            {formatRelative(order.created_at)}
          </p>
        </div>
        {order.status === "completed" && <Badge tone="success">Realizada</Badge>}
        {order.status === "cancelled" && <Badge tone="default">No realizada</Badge>}
        {order.status === "pending" && <Badge tone="warning">Pendiente</Badge>}
      </div>

      {/* Detalle del pedido */}
      <ul className="mt-3 space-y-1 border-t border-border/60 pt-3 text-sm">
        {order.items.map((it, i) => (
          <li key={i} className="flex items-center justify-between gap-2 text-muted">
            <span className="truncate">
              {it.quantity}× {it.name}
              {it.size ? ` (${it.size})` : ""}
            </span>
            <span className="shrink-0">{formatCOP(it.unit_price * it.quantity)}</span>
          </li>
        ))}
      </ul>

      {/* Acciones de confirmación */}
      {order.status === "pending" ? (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => resolve(true)}
            disabled={pending}
            className="flex-1 rounded-xl bg-success/15 px-3 py-2 text-sm font-semibold text-success transition-colors hover:bg-success/25 disabled:opacity-50"
          >
            ✓ Compra realizada
          </button>
          <button
            onClick={() => resolve(false)}
            disabled={pending}
            className="flex-1 rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-border disabled:opacity-50"
          >
            ✗ No realizada
          </button>
        </div>
      ) : order.status === "completed" ? (
        <p className="mt-3 text-xs text-success">✓ Stock descontado del inventario.</p>
      ) : (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted">
          <span>Sin cambios en el inventario.</span>
          <button
            onClick={() => resolve(true)}
            disabled={pending}
            className="font-semibold text-primary hover:underline disabled:opacity-50"
          >
            Marcar como realizada
          </button>
        </div>
      )}
    </li>
  );
}
