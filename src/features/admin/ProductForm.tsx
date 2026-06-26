"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import type { Category, Product, ProductSize } from "@/types/domain";
import { saveProductAction, type ProductActionState } from "@/actions/products";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Input";
import { toast } from "@/store/toastStore";
import { SIZES } from "@/lib/constants";
import { slugify } from "@/lib/utils";

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear producto"}
    </Button>
  );
}

export function ProductForm({
  categories,
  product,
  sizes = [],
}: {
  categories: Category[];
  product?: Product;
  sizes?: ProductSize[];
}) {
  const router = useRouter();
  const editing = !!product;
  const [hasSizes, setHasSizes] = useState(product?.has_sizes ?? false);
  const [slug, setSlug] = useState(product?.slug ?? "");

  const [state, formAction] = useActionState<ProductActionState, FormData>(
    async (prev, fd) => {
      const res = await saveProductAction(prev, fd);
      if (res.success && !editing && res.productId) {
        // Tras crear, ir a la edición para subir imágenes.
        router.push(`/admin/productos/${res.productId}`);
      }
      return res;
    },
    {}
  );

  // Confirmación (toast) al guardar/crear con éxito.
  const handled = useRef<ProductActionState | null>(null);
  useEffect(() => {
    if (state === handled.current) return;
    handled.current = state;
    if (state.success) toast.success(editing ? "Producto guardado satisfactoriamente ✓" : "Producto creado satisfactoriamente ✓");
    else if (state.error && !state.fieldErrors) toast.error(state.error);
  }, [state, editing]);

  const sizeStock = (s: string) => sizes.find((x) => x.size === s)?.stock ?? "";

  return (
    <form action={formAction} className="max-w-2xl space-y-5 rounded-card border border-border bg-surface p-5">
      {editing && <input type="hidden" name="id" value={product.id} />}

      <Field label="Nombre" htmlFor="name" error={state.fieldErrors?.name}>
        <Input
          id="name"
          name="name"
          defaultValue={product?.name}
          onChange={(e) => !editing && setSlug(slugify(e.target.value))}
          required
        />
      </Field>

      <Field label="Slug" htmlFor="slug" error={state.fieldErrors?.slug} hint="URL del producto.">
        <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
      </Field>

      <Field label="Descripción" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={product?.description ?? ""} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoría" htmlFor="category_id" error={state.fieldErrors?.category_id}>
          <Select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""}>
            <option value="">— Selecciona —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Precio (COP)" htmlFor="price" error={state.fieldErrors?.price}>
          <Input id="price" name="price" type="number" min={0} step={1} defaultValue={product?.price ?? ""} required />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="has_sizes"
          checked={hasSizes}
          onChange={(e) => setHasSizes(e.target.checked)}
        />
        Este producto maneja tallas
      </label>

      {hasSizes ? (
        <Field label="Stock por talla" error={state.fieldErrors?.sizes}>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {SIZES.map((s) => (
              <label key={s} className="text-center text-xs text-muted">
                {s}
                <Input
                  name={`size_${s}`}
                  type="number"
                  min={0}
                  defaultValue={sizeStock(s)}
                  placeholder="0"
                  className="mt-1 text-center"
                />
              </label>
            ))}
          </div>
        </Field>
      ) : (
        <Field label="Stock" htmlFor="stock">
          <Input id="stock" name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} className="w-32" />
        </Field>
      )}

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} />
          Destacado
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
          Activo
        </label>
      </div>

      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      {state.success && editing && <p className="text-sm text-success">Cambios guardados.</p>}

      <div className="flex gap-2">
        <SaveButton editing={editing} />
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/productos")}>
          Volver
        </Button>
      </div>
      {!editing && (
        <p className="text-xs text-muted">Tras crear el producto podrás subir imágenes.</p>
      )}
    </form>
  );
}
