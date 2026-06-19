"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import type { News } from "@/types/domain";
import {
  saveNewsAction,
  deleteNewsAction,
  uploadNewsImageAction,
  type NewsActionState,
} from "@/actions/news";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { toast } from "@/store/toastStore";
import { formatDate } from "@/lib/format";

function SaveButton({ editing }: { editing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Guardando…" : editing ? "Actualizar publicación" : "Publicar"}
    </Button>
  );
}

/** ISO → YYYY-MM-DD para el input date. */
function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}

export function NewsManager({ items }: { items: News[] }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<News | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [indefinite, setIndefinite] = useState(true);
  const [uploading, startUpload] = useTransition();
  const [state, formAction] = useActionState<NewsActionState, FormData>(saveNewsAction, {});
  const fileRef = useRef<HTMLInputElement>(null);
  const handled = useRef<NewsActionState | null>(null);

  useEffect(() => {
    if (state === handled.current) return;
    handled.current = state;
    if (state.success) {
      toast.success(editing ? "Publicación actualizada" : "Publicación creada");
      setOpen(false);
      setEditing(null);
    } else if (state.error && !state.fieldErrors) {
      toast.error(state.error);
    }
  }, [state, editing]);

  function startCreate() {
    setEditing(null);
    setImageUrl("");
    setIndefinite(true);
    setOpen(true);
  }
  function startEdit(n: News) {
    setEditing(n);
    setImageUrl(n.image_url ?? "");
    setIndefinite(!n.ends_at);
    setOpen(true);
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.set("file", file);
    startUpload(async () => {
      const res = await uploadNewsImageAction(fd);
      if (res.error) toast.error(res.error);
      else if (res.url) {
        setImageUrl(res.url);
        toast.success("Imagen subida");
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={startCreate}>
          + Crear publicación
        </Button>
      </div>

      {/* Lista */}
      {items.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          Aún no hay publicaciones.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {items.map((n) => {
            const expired = n.ends_at ? new Date(n.ends_at) < new Date() : false;
            return (
              <li key={n.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                {n.image_url && (
                  <div className="relative aspect-[16/9] bg-surface-2">
                    <Image src={n.image_url} alt={n.title ?? ""} fill sizes="400px" className="object-cover" />
                  </div>
                )}
                <div className="space-y-2 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {!n.is_active && <Badge>inactiva</Badge>}
                    {expired ? (
                      <Badge tone="danger">vencida</Badge>
                    ) : n.ends_at ? (
                      <Badge tone="warning">hasta {formatDate(n.ends_at)}</Badge>
                    ) : (
                      <Badge tone="success">indefinida</Badge>
                    )}
                  </div>
                  {n.title && <p className="font-semibold leading-tight">{n.title}</p>}
                  {n.description && <p className="line-clamp-2 text-sm text-muted">{n.description}</p>}
                  <div className="flex gap-1 pt-1">
                    <button
                      onClick={() => startEdit(n)}
                      className="rounded-lg px-2.5 py-1 text-xs font-medium hover:bg-surface-2"
                    >
                      Editar
                    </button>
                    <form
                      action={async (fd) => {
                        await deleteNewsAction(fd);
                        toast.success("Publicación eliminada");
                      }}
                    >
                      <input type="hidden" name="id" value={n.id} />
                      <button className="rounded-lg px-2.5 py-1 text-xs text-danger hover:bg-danger/10">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Modal crear/editar */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={editing ? "Editar publicación" : "Nueva publicación"}
              className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-border bg-surface p-5 sm:rounded-3xl"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold">{editing ? "Editar publicación" : "Nueva publicación"}</h2>
                <button onClick={() => setOpen(false)} aria-label="Cerrar" className="rounded-lg p-1 text-muted hover:bg-surface-2">
                  ✕
                </button>
              </div>

              <form action={formAction} className="space-y-4">
                {editing && <input type="hidden" name="id" value={editing.id} />}
                <input type="hidden" name="image_url" value={imageUrl} />

                {/* Imagen */}
                <Field label="Imagen" error={state.fieldErrors?.title}>
                  {imageUrl ? (
                    <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-surface-2">
                      <Image src={imageUrl} alt="" fill sizes="400px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="absolute right-2 top-2 rounded-full bg-black/60 px-2 text-sm text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={onPickImage}
                      disabled={uploading}
                      className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-foreground"
                    />
                  )}
                  {uploading && <p className="mt-1 text-xs text-muted">Subiendo imagen…</p>}
                </Field>

                <Field label="Título (opcional)" htmlFor="title">
                  <Input id="title" name="title" defaultValue={editing?.title ?? ""} maxLength={120} />
                </Field>
                <Field label="Descripción (opcional)" htmlFor="description">
                  <Textarea id="description" name="description" defaultValue={editing?.description ?? ""} />
                </Field>

                {/* Vigencia */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Vigencia</p>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      name="indefinite"
                      checked={indefinite}
                      onChange={(e) => setIndefinite(e.target.checked)}
                    />
                    Indefinida (sin fecha de finalización)
                  </label>
                  {!indefinite && (
                    <Input
                      type="date"
                      name="ends_at"
                      defaultValue={toDateInput(editing?.ends_at ?? null)}
                      min={new Date().toISOString().slice(0, 10)}
                    />
                  )}
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="is_active" defaultChecked={editing?.is_active ?? true} />
                  Publicación activa
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
