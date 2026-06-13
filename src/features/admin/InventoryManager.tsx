"use client";

import { useMemo, useState } from "react";
import type { InventoryItem } from "@/repositories/adminProductRepository";
import { InventoryRow } from "@/features/admin/InventoryRow";
import { cn } from "@/lib/utils";

type Filter = "all" | "low" | "out";

export function InventoryManager({ items }: { items: InventoryItem[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const outCount = items.filter((i) => i.stock === 0).length;
  const lowCount = items.filter((i) => i.stock > 0 && i.stock <= i.low_stock_threshold).length;

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items
      .filter((i) => (term ? i.name.toLowerCase().includes(term) : true))
      .filter((i) => {
        if (filter === "out") return i.stock === 0;
        if (filter === "low") return i.stock > 0 && i.stock <= i.low_stock_threshold;
        return true;
      });
  }, [items, q, filter]);

  const chips: { value: Filter; label: string; count?: number }[] = [
    { value: "all", label: "Todos", count: items.length },
    { value: "low", label: "Stock bajo", count: lowCount },
    { value: "out", label: "Agotados", count: outCount },
  ];

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar producto…"
        aria-label="Buscar producto en inventario"
        className="h-11 w-full rounded-xl border border-border bg-surface px-4 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* Filtros rápidos */}
      <div className="flex flex-wrap gap-2">
        {chips.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter(c.value)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              filter === c.value
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-surface text-muted hover:text-foreground"
            )}
          >
            {c.label}
            {typeof c.count === "number" && <span className="ml-1.5 opacity-70">{c.count}</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Sin productos para este filtro.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((item) => (
            <InventoryRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
