"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { InventoryItem } from "@/repositories/adminProductRepository";
import { setStockAction, setThresholdAction } from "@/actions/inventory";
import { toast } from "@/store/toastStore";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

/** Control compacto: − [valor] + e input para fijar un valor exacto. */
function Stepper({
  label,
  stock,
  onSet,
  disabled,
}: {
  label?: string;
  stock: number;
  onSet: (value: number) => void;
  disabled?: boolean;
}) {
  const [custom, setCustom] = useState("");

  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && <span className="w-8 shrink-0 text-sm font-semibold">{label}</span>}
      <div className="flex items-center overflow-hidden rounded-lg border border-border">
        <button
          onClick={() => onSet(stock - 1)}
          disabled={disabled || stock === 0}
          aria-label="Restar uno"
          className="h-9 w-9 text-lg text-foreground transition-colors hover:bg-surface-2 disabled:opacity-30"
        >
          −
        </button>
        <span className="min-w-12 text-center text-sm font-semibold tabular-nums">{stock}</span>
        <button
          onClick={() => onSet(stock + 1)}
          disabled={disabled}
          aria-label="Sumar uno"
          className="h-9 w-9 text-lg text-foreground transition-colors hover:bg-surface-2 disabled:opacity-30"
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number"
          min={0}
          inputMode="numeric"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Fijar"
          aria-label={`Fijar valor exacto${label ? ` talla ${label}` : ""}`}
          className="h-9 w-20 rounded-lg border border-border bg-surface px-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={() => {
            if (custom === "") return;
            onSet(Number(custom));
            setCustom("");
          }}
          disabled={disabled || custom === ""}
          className="h-9 rounded-lg bg-surface-2 px-3 text-xs font-semibold transition-colors hover:bg-border disabled:opacity-40"
        >
          Fijar
        </button>
      </div>
    </div>
  );
}

export function InventoryRow({ item }: { item: InventoryItem }) {
  const [pending, startTransition] = useTransition();
  const [threshold, setThreshold] = useState(String(item.low_stock_threshold));
  const [open, setOpen] = useState(false);

  const tone = item.stock === 0 ? "danger" : item.stock <= item.low_stock_threshold ? "warning" : "success";

  function set(size: string | null, value: number) {
    startTransition(async () => {
      await setStockAction({ productId: item.id, size, value: Math.max(0, value) });
      toast.success(`${item.name}${size ? ` · ${size}` : ""}: stock actualizado`);
    });
  }

  function saveThreshold() {
    startTransition(async () => {
      await setThresholdAction(item.id, Number(threshold) || 0);
      toast.success(`Umbral de “${item.name}” actualizado`);
    });
  }

  return (
    <li
      className={cn(
        "rounded-2xl border bg-surface p-4 transition-colors",
        tone === "danger" ? "border-danger/40" : tone === "warning" ? "border-warning/40" : "border-border"
      )}
    >
      {/* Cabecera (clic para expandir) */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg"
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-2">
          {item.primary_image ? (
            <Image src={item.primary_image} alt="" fill sizes="56px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xl">🎴</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{item.name}</p>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-muted">
            {item.category && <span>{item.category}</span>}
            <Badge tone={tone}>
              {item.stock === 0 ? "Agotado" : item.stock <= item.low_stock_threshold ? "Stock bajo" : `${item.stock} uds`}
            </Badge>
          </div>
        </div>
        <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-muted" aria-hidden>
          ⌄
        </motion.span>
      </button>

      {/* Controles (colapsados hasta hacer clic) */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {item.has_sizes ? (
                item.sizes.length === 0 ? (
                  <p className="text-xs text-muted">Sin tallas configuradas. Edita el producto para agregarlas.</p>
                ) : (
                  item.sizes.map((s) => (
                    <Stepper key={s.id} label={s.size} stock={s.stock} disabled={pending} onSet={(v) => set(s.size, v)} />
                  ))
                )
              ) : (
                <Stepper stock={item.stock} disabled={pending} onSet={(v) => set(null, v)} />
              )}
            </div>

            {/* Umbral editable */}
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
              <label htmlFor={`thr-${item.id}`} className="text-xs text-muted">
                Umbral de stock bajo
              </label>
              <input
                id={`thr-${item.id}`}
                type="number"
                min={0}
                inputMode="numeric"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="h-8 w-16 rounded-lg border border-border bg-surface px-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={saveThreshold}
                disabled={pending || threshold === String(item.low_stock_threshold)}
                className="h-8 rounded-lg bg-surface-2 px-3 text-xs font-semibold transition-colors hover:bg-border disabled:opacity-40"
              >
                Guardar umbral
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
