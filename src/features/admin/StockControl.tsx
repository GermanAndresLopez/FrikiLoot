"use client";

import { useTransition } from "react";
import { adjustStockAction } from "@/actions/inventory";
import { Button } from "@/components/ui/Button";

/** Controles rápidos +/- y borrado a cero para stock plano (sin tallas). */
export function StockControl({ productId, stock }: { productId: string; stock: number }) {
  const [pending, startTransition] = useTransition();

  function adjust(delta: number) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("product_id", productId);
      fd.set("delta", String(delta));
      await adjustStockAction(fd);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant="secondary" disabled={pending || stock === 0} onClick={() => adjust(-1)}>
        −1
      </Button>
      <span className="min-w-10 text-center text-sm tabular-nums">{stock}</span>
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => adjust(1)}>
        +1
      </Button>
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => adjust(10)}>
        +10
      </Button>
      {stock > 0 && (
        <Button size="sm" variant="ghost" className="text-danger" disabled={pending} onClick={() => adjust(-stock)}>
          Agotar
        </Button>
      )}
    </div>
  );
}
