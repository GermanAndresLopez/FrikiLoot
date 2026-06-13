"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { Category } from "@/types/domain";
import { SORT_OPTIONS, AVAILABILITY_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Barra de filtros del catálogo. Sincroniza el estado con la URL. */
export function CatalogFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const sp = new URLSearchParams(params.toString());
      if (value) sp.set(key, value);
      else sp.delete(key);
      sp.delete("page"); // reset paginación al filtrar
      router.push(`/productos${sp.toString() ? `?${sp}` : ""}`);
    },
    [params, router]
  );

  const activeCat = params.get("category");
  const sort = params.get("sort") ?? "recientes";
  const availability = params.get("availability") ?? "all";

  return (
    <div className="space-y-3">
      {/* Categorías (chips) */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip active={!activeCat} onClick={() => setParam("category", null)}>
          Todo
        </Chip>
        {categories.map((c) => (
          <Chip key={c.id} active={activeCat === c.slug} onClick={() => setParam("category", c.slug)}>
            {c.name}
          </Chip>
        ))}
      </div>

      {/* Orden + disponibilidad */}
      <div className="flex gap-2">
        <select
          value={sort}
          onChange={(e) => setParam("sort", e.target.value)}
          className="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          aria-label="Ordenar"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={availability}
          onChange={(e) => setParam("availability", e.target.value === "all" ? null : e.target.value)}
          className="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-sm focus:border-primary focus:outline-none"
          aria-label="Disponibilidad"
        >
          {AVAILABILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface text-muted"
      )}
    >
      {children}
    </button>
  );
}
