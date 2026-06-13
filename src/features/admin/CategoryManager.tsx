"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { Category } from "@/types/domain";
import {
  saveCategoryAction,
  deleteCategoryAction,
  type CategoryActionState,
} from "@/actions/categories";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { slugify } from "@/lib/utils";

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando…" : editing ? "Actualizar" : "Crear categoría"}
    </Button>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);
  const [autoSlug, setAutoSlug] = useState("");
  const [state, formAction] = useActionState<CategoryActionState, FormData>(saveCategoryAction, {});

  // Reset al guardar con éxito
  const formKey = editing?.id ?? "new";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <form
        key={formKey + (state.success ? "-ok" : "")}
        action={formAction}
        className="space-y-4 rounded-card border border-border bg-surface p-5"
      >
        <h2 className="font-semibold">{editing ? "Editar categoría" : "Nueva categoría"}</h2>
        {editing && <input type="hidden" name="id" value={editing.id} />}

        <Field label="Nombre" htmlFor="name" error={state.fieldErrors?.name}>
          <Input
            id="name"
            name="name"
            defaultValue={editing?.name}
            onChange={(e) => setAutoSlug(slugify(e.target.value))}
            required
          />
        </Field>
        <Field label="Slug" htmlFor="slug" hint="Se autogenera del nombre." error={state.fieldErrors?.slug}>
          <Input id="slug" name="slug" defaultValue={editing?.slug ?? autoSlug} key={autoSlug} />
        </Field>
        <Field label="Descripción" htmlFor="description">
          <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
        </Field>
        <Field label="URL de imagen" htmlFor="image_url" error={state.fieldErrors?.image_url}>
          <Input id="image_url" name="image_url" defaultValue={editing?.image_url ?? ""} placeholder="https://…" />
        </Field>
        <div className="flex gap-4">
          <Field label="Orden" htmlFor="display_order">
            <Input
              id="display_order"
              name="display_order"
              type="number"
              min={0}
              defaultValue={editing?.display_order ?? 0}
              className="w-24"
            />
          </Field>
          <label className="flex items-center gap-2 pt-7 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} />
            Activa
          </label>
        </div>

        {state.error && <p className="text-sm text-danger">{state.error}</p>}

        <div className="flex gap-2">
          <SaveButton editing={!!editing} />
          {editing && (
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
          )}
        </div>
      </form>

      <ul className="space-y-2">
        {categories.length === 0 && <li className="text-sm text-muted">No hay categorías aún.</li>}
        {categories.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                <span className="truncate">{c.name}</span>
                {!c.is_active && <Badge tone="default">inactiva</Badge>}
              </p>
              <p className="truncate text-xs text-muted">/{c.slug} · orden {c.display_order}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button size="sm" variant="ghost" onClick={() => setEditing(c)}>
                Editar
              </Button>
              <form action={deleteCategoryAction}>
                <input type="hidden" name="id" value={c.id} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger"
                  type="submit"
                >
                  Eliminar
                </Button>
              </form>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
