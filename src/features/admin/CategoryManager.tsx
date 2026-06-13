"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { Category } from "@/types/domain";
import {
  saveCategoryAction,
  deleteCategoryAction,
  type CategoryActionState,
} from "@/actions/categories";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/store/toastStore";
import { slugify } from "@/lib/utils";

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Guardando…" : editing ? "Actualizar categoría" : "Crear categoría"}
    </Button>
  );
}

export function CategoryManager({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [autoSlug, setAutoSlug] = useState("");
  const [state, formAction] = useActionState<CategoryActionState, FormData>(saveCategoryAction, {});
  const handled = useRef<CategoryActionState | null>(null);

  // Reacciona al resultado de la acción (toast + cerrar).
  useEffect(() => {
    if (state === handled.current) return;
    handled.current = state;
    if (state.success) {
      toast.success(editing ? "Categoría actualizada" : "Categoría creada");
      setOpen(false);
      setEditing(null);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, editing]);

  function startCreate() {
    setEditing(null);
    setAutoSlug("");
    setOpen(true);
  }
  function startEdit(c: Category) {
    setEditing(c);
    setOpen(true);
  }

  return (
    <>
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={startCreate}>
          + Crear categoría
        </Button>
      </div>

      {/* Lista de categorías */}
      {categories.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Aún no hay categorías. Crea la primera.
        </p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-3 transition-colors hover:bg-surface-2/40"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold">
                  <span className="truncate">{c.name}</span>
                  {!c.is_active && <Badge>inactiva</Badge>}
                </p>
                <p className="truncate text-xs text-muted">/{c.slug}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  onClick={() => startEdit(c)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium hover:bg-surface-2"
                >
                  Editar
                </button>
                <form
                  action={async (fd) => {
                    await deleteCategoryAction(fd);
                    toast.success("Categoría eliminada");
                  }}
                >
                  <input type="hidden" name="id" value={c.id} />
                  <button className="rounded-lg px-2.5 py-1 text-xs text-danger hover:bg-danger/10">
                    Eliminar
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de creación/edición */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={editing ? "Editar categoría" : "Nueva categoría"}
              className="w-full max-w-md rounded-t-3xl border border-border bg-surface p-5 sm:rounded-3xl"
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Editar categoría" : "Nueva categoría"}</h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Cerrar"
                  className="rounded-lg p-1 text-muted hover:bg-surface-2 hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <form action={formAction} className="space-y-4">
                {editing && <input type="hidden" name="id" value={editing.id} />}
                <Field label="Nombre" htmlFor="name" error={state.fieldErrors?.name}>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editing?.name}
                    onChange={(e) => setAutoSlug(slugify(e.target.value))}
                    required
                    autoFocus
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
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} />
                  Categoría activa
                </label>

                <SaveButton editing={!!editing} />
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
