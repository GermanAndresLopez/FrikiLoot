"use client";

import { useRef, useState, useTransition, useCallback } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/domain";
import {
  uploadProductImagesAction,
  deleteProductImageAction,
  setPrimaryImageAction,
} from "@/actions/products";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/store/toastStore";
import { cn } from "@/lib/utils";

interface Preview {
  file: File;
  url: string;
}

export function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const [pending, startTransition] = useTransition();
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [primaryIdx, setPrimaryIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const clearPreviews = useCallback(() => {
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p.url));
      return [];
    });
    setPrimaryIdx(0);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  function onFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    previews.forEach((p) => URL.revokeObjectURL(p.url));

    const newPreviews = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(newPreviews);
    setPrimaryIdx(0);
  }

  function removePreview(idx: number) {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      const next = prev.filter((_, i) => i !== idx);
      if (next.length === 0 && inputRef.current) inputRef.current.value = "";
      return next;
    });
    setPrimaryIdx((prev) => {
      if (idx === prev) return 0;
      if (idx < prev) return prev - 1;
      return prev;
    });
  }

  function upload() {
    if (previews.length === 0) return;
    const fd = new FormData();
    fd.set("product_id", productId);
    fd.set("primary_index", String(primaryIdx));
    previews.forEach((p) => fd.append("files", p.file));

    startTransition(async () => {
      const res = await uploadProductImagesAction(fd);
      if (res.error && !res.uploaded) {
        toast.error(res.error);
        return;
      }
      toast.success(`${res.uploaded} imagen(es) subida(s) ✓`);
      clearPreviews();
    });
  }

  function makePrimary(imageId: string) {
    startTransition(async () => {
      await setPrimaryImageAction(productId, imageId);
      toast.success("Imagen principal actualizada");
    });
  }

  return (
    <section className="max-w-2xl space-y-4 rounded-card border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Imágenes</h2>
        <span className="text-xs text-muted">{images.length} foto(s)</span>
      </div>

      {/* Imágenes existentes */}
      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <li key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-surface-2">
              <Image src={img.url} alt={img.alt ?? ""} fill sizes="120px" className="object-cover" />

              {img.is_primary ? (
                <Badge tone="primary" className="absolute left-1 top-1">
                  principal
                </Badge>
              ) : (
                <button
                  onClick={() => makePrimary(img.id)}
                  disabled={pending}
                  className="absolute bottom-1 left-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                >
                  Hacer principal
                </button>
              )}

              <form action={deleteProductImageAction} className="absolute right-1 top-1">
                <input type="hidden" name="image_id" value={img.id} />
                <input type="hidden" name="product_id" value={productId} />
                <button
                  type="submit"
                  className="rounded-full bg-black/60 px-2 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Eliminar imagen"
                >
                  ✕
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {/* Selector de archivos */}
      <div className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFilesChange}
          disabled={pending}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-foreground"
        />
        <p className="text-xs text-muted">
          Selecciona varias a la vez (máx. 5 MB c/u). Haz clic en una para marcarla como principal.
        </p>
      </div>

      {/* Vista previa antes de subir */}
      {previews.length > 0 && (
        <div className="space-y-3 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Vista previa — {previews.length} imagen(es)
          </p>

          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {previews.map((p, i) => (
              <li
                key={p.url}
                className={cn(
                  "group relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all",
                  i === primaryIdx
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setPrimaryIdx(i)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" className="h-full w-full object-cover" />

                {i === primaryIdx && (
                  <Badge tone="primary" className="absolute left-1 top-1">
                    principal
                  </Badge>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePreview(i);
                  }}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-2 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Quitar"
                >
                  ✕
                </button>

                <p className="absolute bottom-0 inset-x-0 truncate bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                  {p.file.name}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex gap-2">
            <Button size="sm" onClick={upload} disabled={pending}>
              {pending ? "Subiendo…" : `Subir ${previews.length} imagen(es)`}
            </Button>
            <Button size="sm" variant="ghost" onClick={clearPreviews} disabled={pending}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
