"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductDetail } from "@/types/domain";
import { useCartStore } from "@/store/cartStore";
import { getSessionId } from "@/lib/session";
import { logCartEventAction } from "@/actions/metrics";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function AddToCartPanel({ product }: { product: ProductDetail }) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const sizesWithStock = product.sizes.filter((s) => s.stock > 0);
  const needsSize = product.has_sizes;

  // Stock disponible según selección
  const availableStock = needsSize
    ? size
      ? product.sizes.find((s) => s.size === size)?.stock ?? 0
      : 0
    : product.stock;

  const agotado = product.effective_stock === 0;
  const canAdd = !agotado && (!needsSize || !!size) && availableStock > 0;

  function handleAdd() {
    if (!canAdd) return;
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0]?.url ?? null,
        size,
        maxStock: availableStock,
      },
      qty
    );
    void logCartEventAction({
      productId: product.id,
      size,
      quantity: qty,
      eventType: "add",
      sessionId: getSessionId(),
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  if (agotado) {
    return (
      <div className="rounded-xl border border-danger/40 bg-danger/10 p-4 text-center text-sm font-medium text-danger">
        Producto agotado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {needsSize && (
        <div>
          <p className="mb-2 text-sm font-medium">Talla</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              const disabled = s.stock === 0;
              return (
                <button
                  key={s.id}
                  disabled={disabled}
                  onClick={() => {
                    setSize(s.size);
                    setQty(1);
                  }}
                  className={cn(
                    "min-w-12 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    disabled && "cursor-not-allowed border-border text-muted/40 line-through",
                    !disabled && size === s.size
                      ? "border-primary bg-primary/15 text-primary"
                      : !disabled && "border-border hover:border-primary"
                  )}
                >
                  {s.size}
                </button>
              );
            })}
          </div>
          {needsSize && !size && sizesWithStock.length > 0 && (
            <p className="mt-1 text-xs text-muted">Selecciona una talla.</p>
          )}
        </div>
      )}

      {/* Cantidad */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Cantidad</span>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="secondary" disabled={qty <= 1} onClick={() => setQty((q) => q - 1)}>
            −
          </Button>
          <span className="min-w-10 text-center tabular-nums">{qty}</span>
          <Button
            size="sm"
            variant="secondary"
            disabled={qty >= availableStock || availableStock === 0}
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </Button>
        </div>
        {availableStock > 0 && availableStock <= 5 && (
          <span className="text-xs text-warning">¡Solo {availableStock}!</span>
        )}
      </div>

      <div className="flex gap-2">
        <Button className="flex-1" disabled={!canAdd} onClick={handleAdd}>
          {added ? "✓ Agregado" : "Agregar al carrito"}
        </Button>
        <Button variant="outline" onClick={() => router.push("/carrito")}>
          Ver carrito
        </Button>
      </div>
    </div>
  );
}
