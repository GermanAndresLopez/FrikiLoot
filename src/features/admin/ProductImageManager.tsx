"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/domain";
import { uploadProductImageAction, deleteProductImageAction } from "@/actions/products";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function onUpload(formData: FormData) {
    setError(undefined);
    formData.set("product_id", productId);
    startTransition(async () => {
      const res = await uploadProductImageAction(formData);
      if (res.error) setError(res.error);
    });
  }

  return (
    <section className="max-w-2xl space-y-4 rounded-card border border-border bg-surface p-5">
      <h2 className="font-semibold">Imágenes</h2>

      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <li key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-surface-2">
              <Image src={img.url} alt={img.alt ?? ""} fill sizes="120px" className="object-cover" />
              {img.is_primary && (
                <Badge tone="primary" className="absolute left-1 top-1">
                  principal
                </Badge>
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

      <form action={onUpload} className="space-y-3">
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-foreground"
        />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_primary" />
          Marcar como imagen principal
        </label>
        {error && <p className="text-sm text-danger">{error}</p>}
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Subiendo…" : "Subir imagen"}
        </Button>
      </form>
    </section>
  );
}
