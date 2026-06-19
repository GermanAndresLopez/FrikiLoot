"use client";

import { useRef, useState, useTransition } from "react";
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

export function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function onUpload(formData: FormData) {
    formData.set("product_id", productId);
    startTransition(async () => {
      const res = await uploadProductImagesAction(formData);
      if (res.error && !res.uploaded) {
        toast.error(res.error);
        return;
      }
      toast.success(`${res.uploaded} imagen(es) subida(s)${res.error ? " · " + res.error : ""}`);
      setSelected(0);
      if (inputRef.current) inputRef.current.value = "";
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

      <form action={onUpload} className="space-y-3">
        <input
          ref={inputRef}
          type="file"
          name="files"
          accept="image/*"
          multiple
          onChange={(e) => setSelected(e.target.files?.length ?? 0)}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-foreground"
        />
        <p className="text-xs text-muted">
          Puedes seleccionar varias a la vez (máx. 5 MB c/u). La primera será la principal.
        </p>
        <Button type="submit" size="sm" disabled={pending || selected === 0}>
          {pending ? "Subiendo…" : selected > 1 ? `Subir ${selected} imágenes` : "Subir imagen"}
        </Button>
      </form>
    </section>
  );
}
