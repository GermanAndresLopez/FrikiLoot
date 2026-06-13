"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, useCartTotal } from "@/store/cartStore";
import { getSessionId } from "@/lib/session";
import { formatCOP } from "@/lib/format";
import { checkoutAction } from "@/actions/orders";
import { logCartEventAction } from "@/actions/metrics";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export function CartView() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clear = useCartStore((s) => s.clear);
  const total = useCartTotal();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <p className="py-10 text-center text-muted">Cargando…</p>;

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-4xl">🛒</p>
        <p className="mt-3 text-muted">Tu carrito está vacío.</p>
        <Link href="/productos" className="mt-4 inline-block">
          <Button>Explorar catálogo</Button>
        </Link>
      </div>
    );
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const res = await checkoutAction({
      items: items.map((i) => ({
        product_id: i.productId,
        name: i.name,
        size: i.size,
        quantity: i.quantity,
        unit_price: i.price,
      })),
      total,
      customer_name: name,
      customer_phone: phone,
      session_id: getSessionId(),
    });

    setLoading(false);

    if (res.error) {
      setErrors(res.fieldErrors ?? { _: res.error });
      return;
    }
    if (res.url) {
      // Registra envíos a WhatsApp por ítem (métrica de carrito → conversión).
      const sid = getSessionId();
      items.forEach((i) =>
        void logCartEventAction({ productId: i.productId, size: i.size, quantity: i.quantity, eventType: "update", sessionId: sid })
      );
      clear();
      window.location.href = res.url;
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      {/* Lista de ítems */}
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.size ?? ""}`}
            className="flex gap-3 rounded-card border border-border bg-surface p-3"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-2">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">🎴</div>
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <Link href={`/producto/${item.slug}`} className="truncate font-medium hover:text-primary">
                {item.name}
              </Link>
              {item.size && <p className="text-xs text-muted">Talla {item.size}</p>}
              <p className="text-sm font-semibold text-primary">{formatCOP(item.price)}</p>

              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={item.quantity <= 1}
                    onClick={() => setQuantity(item.productId, item.size, item.quantity - 1)}
                  >
                    −
                  </Button>
                  <span className="min-w-8 text-center text-sm tabular-nums">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={item.quantity >= item.maxStock}
                    onClick={() => setQuantity(item.productId, item.size, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <button
                  onClick={() => removeItem(item.productId, item.size)}
                  className="text-xs text-danger hover:underline"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </li>
        ))}
        <li>
          <button onClick={clear} className="text-sm text-muted hover:text-danger">
            Vaciar carrito
          </button>
        </li>
      </ul>

      {/* Resumen + checkout */}
      <form
        onSubmit={handleCheckout}
        className="h-fit space-y-4 rounded-card border border-border bg-surface p-5 lg:sticky lg:top-20"
      >
        <div className="flex items-center justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">{formatCOP(total)}</span>
        </div>
        <hr className="border-border" />
        <Field label="Tu nombre" htmlFor="name" error={errors.customer_name}>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </Field>
        <Field label="Teléfono" htmlFor="phone" error={errors.customer_phone}>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="tel"
            placeholder="300 123 4567"
            required
          />
        </Field>
        {errors._ && <p className="text-sm text-danger">{errors._}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Procesando…" : "Finalizar pedido por WhatsApp"}
        </Button>
        <p className="text-center text-xs text-muted">
          Te llevaremos a WhatsApp con el pedido listo para enviar.
        </p>
      </form>
    </div>
  );
}
