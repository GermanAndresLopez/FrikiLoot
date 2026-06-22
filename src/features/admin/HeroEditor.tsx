"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { DEFAULT_HERO, type HeroConfig } from "@/lib/hero";
import { saveHeroAction, uploadHeroImageAction } from "@/actions/hero";
import { toast } from "@/store/toastStore";
import { HeroView } from "@/features/home/HeroView";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

const HEX = /^#[0-9a-fA-F]{6}$/;

export function HeroEditor({ initial }: { initial: HeroConfig }) {
  const [hero, setHero] = useState<HeroConfig>(initial);
  const [pending, startTransition] = useTransition();
  const [uploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty = JSON.stringify(hero) !== JSON.stringify(initial);

  function set<K extends keyof HeroConfig>(key: K, value: HeroConfig[K]) {
    setHero((h) => ({ ...h, [key]: value }));
  }

  function onAddImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    startUpload(async () => {
      for (const file of files) {
        if (hero.images.length >= 6) {
          toast.error("Máximo 6 imágenes.");
          break;
        }
        const fd = new FormData();
        fd.set("file", file);
        const res = await uploadHeroImageAction(fd);
        if (res.error) toast.error(res.error);
        else if (res.url) setHero((h) => ({ ...h, images: [...h.images, res.url!].slice(0, 6) }));
      }
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function removeImage(i: number) {
    setHero((h) => ({ ...h, images: h.images.filter((_, idx) => idx !== i) }));
  }

  function save() {
    startTransition(async () => {
      const res = await saveHeroAction(hero);
      if (res.error) return toast.error(res.error);
      toast.success("Portada actualizada ✨");
    });
  }

  return (
    <div className="space-y-6">
      {/* Vista previa de la zona */}
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Vista previa de la portada</p>
        <div className="rounded-card border border-dashed border-border p-3">
          <HeroView config={hero} preview />
        </div>
      </section>

      {/* Imágenes */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Imágenes</h2>
          <p className="text-xs text-muted">Agrega hasta 6. Si no agregas ninguna, se muestra el logo.</p>
        </div>
        {hero.images.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {hero.images.map((src, i) => (
              <li key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl border border-border bg-surface-2">
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Quitar imagen"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        {hero.images.length < 6 && (
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onAddImages}
            disabled={uploading}
            className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-foreground"
          />
        )}
        {uploading && <p className="text-xs text-muted">Subiendo…</p>}
      </section>

      {/* Textos */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold">Textos</h2>
        <Field label="Título" htmlFor="hero-title" hint="Usa saltos de línea si quieres dividirlo.">
          <Textarea
            id="hero-title"
            value={hero.title}
            onChange={(e) => set("title", e.target.value)}
            rows={2}
            maxLength={120}
          />
        </Field>
        <Field label="Subtítulo" htmlFor="hero-sub">
          <Textarea
            id="hero-sub"
            value={hero.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
            rows={2}
            maxLength={300}
          />
        </Field>
      </section>

      {/* Colores del texto */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Colores del texto</h2>

        <label className="flex items-center gap-2 rounded-xl border border-border bg-surface p-3 text-sm">
          <input
            type="checkbox"
            checked={hero.titleGradient}
            onChange={(e) => set("titleGradient", e.target.checked)}
          />
          Título con gradiente de marca
        </label>

        {!hero.titleGradient && (
          <ColorRow label="Color del título" value={hero.titleColor} onChange={(v) => set("titleColor", v)} />
        )}
        <ColorRow label="Color del subtítulo" value={hero.subtitleColor} onChange={(v) => set("subtitleColor", v)} />
      </section>

      {/* Acciones */}
      <div className="sticky bottom-20 z-10 flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/90 p-3 backdrop-blur md:bottom-4">
        <Button onClick={save} disabled={pending || !dirty}>
          {pending ? "Guardando…" : dirty ? "Guardar portada" : "Sin cambios"}
        </Button>
        <Button variant="outline" onClick={() => setHero({ ...DEFAULT_HERO })} disabled={pending}>
          Restablecer
        </Button>
        <Button variant="ghost" onClick={() => setHero({ ...initial })} disabled={pending || !dirty}>
          Descartar
        </Button>
      </div>
    </div>
  );
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const valid = HEX.test(value);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5">
      <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border">
        <span className="absolute inset-0" style={{ background: valid ? value : "#000" }} />
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{label}</p>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className={cn(
            "mt-0.5 w-24 rounded-md border bg-surface-2 px-2 py-0.5 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-primary/30",
            valid ? "border-border" : "border-danger"
          )}
        />
      </div>
    </div>
  );
}
