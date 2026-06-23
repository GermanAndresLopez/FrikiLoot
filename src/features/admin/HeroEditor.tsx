"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { DEFAULT_HERO, type HeroConfig } from "@/lib/hero";
import { saveHeroAction, uploadHeroImageAction } from "@/actions/hero";
import { toast } from "@/store/toastStore";
import { HeroView } from "@/features/home/HeroView";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Input";
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

  function onUploadBg(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    startUpload(async () => {
      const fd = new FormData();
      fd.set("file", file);
      const res = await uploadHeroImageAction(fd);
      if (res.error) toast.error(res.error);
      else if (res.url) set("backgroundImage", res.url);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  function removeBg() {
    set("backgroundImage", "");
  }

  function save() {
    startTransition(async () => {
      const res = await saveHeroAction(hero);
      if (res.error) return toast.error(res.error);
      toast.success("Portada actualizada ✨");
    });
  }

  const opacityPct = Math.round(hero.backgroundOpacity * 100);

  return (
    <div className="space-y-6">
      {/* Vista previa */}
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Vista previa de la portada</p>
        <div className="rounded-card border border-dashed border-border p-3">
          <HeroView config={hero} preview />
        </div>
      </section>

      {/* Imagen de fondo */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold">Imagen de fondo</h2>
          <p className="text-xs text-muted">Sube un banner. Si no agregas ninguno, se muestra solo el color de fondo.</p>
        </div>

        {hero.backgroundImage ? (
          <div className="group relative aspect-[21/9] w-full overflow-hidden rounded-xl border border-border bg-surface-2">
            <Image src={hero.backgroundImage} alt="Banner actual" fill sizes="100%" className="object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
              <button
                onClick={removeBg}
                className="rounded-xl bg-danger px-4 py-2 text-sm font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100"
              >
                Quitar imagen
              </button>
            </div>
          </div>
        ) : (
          <div className="flex aspect-[21/9] w-full items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface-2 text-sm text-muted">
            Sin imagen de fondo
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={onUploadBg}
          disabled={uploading}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-foreground"
        />
        {uploading && <p className="text-xs text-muted">Subiendo…</p>}

        {/* Opacidad */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <label htmlFor="bg-opacity" className="text-sm font-medium">Transparencia del fondo</label>
            <span className="rounded-lg bg-surface-2 px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums">
              {opacityPct}%
            </span>
          </div>
          <p className="mb-3 text-xs text-muted">0% = invisible, 100% = sin transparencia</p>
          <input
            id="bg-opacity"
            type="range"
            min={0}
            max={100}
            step={5}
            value={opacityPct}
            onChange={(e) => set("backgroundOpacity", Number(e.target.value) / 100)}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Desenfoque */}
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <label htmlFor="bg-blur" className="text-sm font-medium">Desenfoque del fondo</label>
            <span className="rounded-lg bg-surface-2 px-2.5 py-0.5 font-mono text-xs font-semibold tabular-nums">
              {hero.backgroundBlur}px
            </span>
          </div>
          <p className="mb-3 text-xs text-muted">0 = nítido, 20 = muy borroso</p>
          <input
            id="bg-blur"
            type="range"
            min={0}
            max={20}
            step={1}
            value={hero.backgroundBlur}
            onChange={(e) => set("backgroundBlur", Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted">
            <span>0</span>
            <span>10</span>
            <span>20</span>
          </div>
        </div>
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
