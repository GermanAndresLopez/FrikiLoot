"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import type { OrderRow } from "@/repositories/orderRepository";
import type { OrderItemSnapshot } from "@/types/database";
import { fulfillOrderAction, updateOrderItemsAction } from "@/actions/orders";
import { formatCOP, formatRelative } from "@/lib/format";
import { toast } from "@/store/toastStore";
import { Badge } from "@/components/ui/Badge";

type BasicProduct = { id: string; name: string; price: number };

export function OrderCard({ order, products }: { order: OrderRow; products: BasicProduct[] }) {
  const [pending, startTransition] = useTransition();
  const [resolved, setResolved] = useState(false); // remoción optimista
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState<OrderItemSnapshot[]>(order.items);
  const [picker, setPicker] = useState("");

  const editTotal = items.reduce((a, i) => a + i.unit_price * i.quantity, 0);

  function resolve(completed: boolean) {
    startTransition(async () => {
      const res = await fulfillOrderAction(order.id, completed);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        completed ? "Compra confirmada · stock descontado" : "Pedido marcado como no realizado"
      );
      setResolved(true); // se quita de la lista al instante
    });
  }

  function startEdit() {
    setItems(order.items.map((i) => ({ ...i })));
    setEditing(true);
  }
  function changeQty(index: number, delta: number) {
    setItems((arr) =>
      arr.map((it, i) => (i === index ? { ...it, quantity: Math.max(1, it.quantity + delta) } : it))
    );
  }
  function removeItem(index: number) {
    setItems((arr) => arr.filter((_, i) => i !== index));
  }
  function addProduct(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setItems((arr) => {
      const idx = arr.findIndex((i) => i.product_id === p.id && i.size === null);
      if (idx >= 0) {
        return arr.map((it, i) => (i === idx ? { ...it, quantity: it.quantity + 1 } : it));
      }
      return [...arr, { product_id: p.id, name: p.name, size: null, quantity: 1, unit_price: p.price }];
    });
  }
  function saveEdit() {
    startTransition(async () => {
      const res = await updateOrderItemsAction(order.id, items);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Pedido actualizado");
      setEditing(false);
    });
  }

  if (resolved) return null;

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-primary/40 bg-surface p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            {order.customer_name || "Cliente"}{" "}
            <span className="text-sm font-normal text-muted">
              · {formatCOP(editing ? editTotal : order.total)}
            </span>
          </p>
          <p className="text-xs text-muted">
            {order.customer_phone ? `${order.customer_phone} · ` : ""}
            {formatRelative(order.created_at)}
          </p>
        </div>
        <Badge tone="warning">Pendiente</Badge>
      </div>

      {/* Ítems */}
      <ul className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-sm">
        {items.map((it, i) => (
          <li key={`${it.product_id}-${it.size ?? ""}-${i}`} className="flex items-center justify-between gap-2">
            <span className="min-w-0 flex-1 truncate text-muted">
              {it.name}
              {it.size ? ` (${it.size})` : ""}
            </span>

            {editing ? (
              <div className="flex shrink-0 items-center gap-1.5">
                <div className="flex items-center overflow-hidden rounded-lg border border-border">
                  <button
                    onClick={() => changeQty(i, -1)}
                    disabled={it.quantity <= 1}
                    aria-label="Restar"
                    className="h-7 w-7 text-foreground hover:bg-surface-2 disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="min-w-7 text-center text-xs font-semibold tabular-nums">{it.quantity}</span>
                  <button
                    onClick={() => changeQty(i, 1)}
                    aria-label="Sumar"
                    className="h-7 w-7 text-foreground hover:bg-surface-2"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeItem(i)}
                  aria-label="Quitar producto"
                  className="rounded-lg px-2 py-1 text-xs text-danger hover:bg-danger/10"
                >
                  ✕
                </button>
              </div>
            ) : (
              <span className="shrink-0 tabular-nums text-muted">
                {it.quantity}× · {formatCOP(it.unit_price * it.quantity)}
              </span>
            )}
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-xs text-danger">El pedido quedó sin productos. Agrega al menos uno.</li>
        )}
      </ul>

      {/* Selector para agregar productos (modo edición) */}
      {editing && (
        <div className="mt-3 flex items-center gap-2">
          <select
            value={picker}
            onChange={(e) => {
              if (e.target.value) addProduct(e.target.value);
              setPicker("");
            }}
            aria-label="Agregar producto al pedido"
            className="h-9 flex-1 rounded-lg border border-border bg-surface px-2 text-sm focus:border-primary focus:outline-none"
          >
            <option value="">+ Agregar producto…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {formatCOP(p.price)}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Acciones */}
      {editing ? (
        <div className="mt-3 flex gap-2">
          <button
            onClick={saveEdit}
            disabled={pending || items.length === 0}
            className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            Guardar cambios
          </button>
          <button
            onClick={() => {
              setItems(order.items);
              setEditing(false);
            }}
            disabled={pending}
            className="rounded-xl bg-surface-2 px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-border"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
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
          <button
            onClick={startEdit}
            disabled={pending}
            className="rounded-xl border border-border px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:opacity-50"
          >
            Editar
          </button>
        </div>
      )}
    </motion.li>
  );
}
