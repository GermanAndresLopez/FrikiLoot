"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { AdminProductRow } from "@/repositories/adminProductRepository";
import { toggleFeaturedAction, deleteProductAction } from "@/actions/products";
import { formatCOP } from "@/lib/format";
import { toast } from "@/store/toastStore";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

export function ProductRow({ product }: { product: AdminProductRow }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const stock = product.total_size_stock ?? product.stock;
  const tone = stock === 0 ? "danger" : stock <= product.low_stock_threshold ? "warning" : "success";

  function toggleFeatured() {
    startTransition(async () => {
      await toggleFeaturedAction(product.id, !product.is_featured);
      toast.success(product.is_featured ? "Quitado de destacados" : "Marcado como destacado");
    });
  }

  function confirmDelete() {
    const fd = new FormData();
    fd.set("id", product.id);
    startTransition(async () => {
      await deleteProductAction(fd);
      toast.success("Producto eliminado correctamente");
    });
    setConfirming(false);
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface p-3 transition-colors hover:border-border/80 hover:bg-surface-2/40"
    >
      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
          {product.primary_image ? (
            <Image src={product.primary_image} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-2xl">🎴</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-tight">{product.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span className="font-semibold text-primary">{formatCOP(product.price)}</span>
            <span aria-hidden>·</span>
            <span className={cn(tone === "danger" && "text-danger", tone === "warning" && "text-warning")}>
              {stock === 0 ? "Agotado" : `${stock} en stock`}
            </span>
            {product.category && (
              <>
                <span aria-hidden>·</span>
                <span>{product.category.name}</span>
              </>
            )}
            {product.popularity_score > 0 && (
              <>
                <span aria-hidden>·</span>
                <span className="text-accent">🔥 {product.popularity_score}</span>
              </>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {!product.is_active && <Badge>inactivo</Badge>}
            {product.has_sizes && <Badge tone="accent">tallas</Badge>}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button
            onClick={toggleFeatured}
            disabled={pending}
            aria-pressed={product.is_featured}
            aria-label={product.is_featured ? "Quitar de destacados" : "Marcar como destacado"}
            title={product.is_featured ? "Destacado" : "Marcar destacado"}
            className={cn(
              "rounded-lg p-1.5 text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              product.is_featured ? "text-warning" : "text-muted hover:text-warning"
            )}
          >
            {product.is_featured ? "★" : "☆"}
          </button>

          <div className="flex items-center gap-1">
            <Link
              href={`/admin/productos/${product.id}`}
              className="rounded-lg px-2.5 py-1 text-xs font-medium text-foreground hover:bg-surface-2"
            >
              Editar
            </Link>
            <button
              onClick={() => setConfirming(true)}
              className="rounded-lg px-2.5 py-1 text-xs text-danger hover:bg-danger/10"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Overlay de confirmación */}
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-bg/90 backdrop-blur-sm"
          >
            <p className="text-sm font-semibold text-danger">
              ¿Eliminar "{product.name}"?
            </p>
            <p className="text-xs text-muted">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2">
              <button
                onClick={confirmDelete}
                disabled={pending}
                className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:bg-danger/90 active:scale-95"
              >
                {pending ? "Eliminando…" : "Sí, eliminar"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-surface-2 active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
