"use client";

import { useState, useTransition } from "react";
import {
  THEME_GROUPS,
  TOKEN_LABELS,
  PRESETS,
  DEFAULT_THEME,
  type Theme,
} from "@/lib/theme";
import { saveThemeAction } from "@/actions/theme";
import { toast } from "@/store/toastStore";
import { ThemePreview } from "@/features/admin/ThemePreview";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const HEX = /^#[0-9a-fA-F]{6}$/;

export function ThemeEditor({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(theme) !== JSON.stringify(initial);

  function setField(key: keyof Omit<Theme, "mode">, value: string) {
    setTheme((t) => ({ ...t, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      const res = await saveThemeAction(theme);
      if (res.error) return toast.error(res.error);
      toast.success("Tema aplicado a toda la tienda 🎨");
    });
  }

  // ¿El tema actual coincide con un preset?
  const activePreset = PRESETS.find((p) => JSON.stringify(p.theme) === JSON.stringify(theme))?.id;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* ── Editor ── */}
      <div className="space-y-7 lg:order-1">
        {/* Presets */}
        <section>
          <h2 className="text-sm font-semibold">1. Empieza con un estilo</h2>
          <p className="mb-3 text-xs text-muted">Elige una base y luego ajusta lo que quieras.</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => {
              const active = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setTheme({ ...p.theme })}
                  className={cn(
                    "rounded-2xl border-2 p-2 text-left transition-all",
                    active ? "border-primary" : "border-border hover:border-muted"
                  )}
                >
                  {/* Mini swatch */}
                  <div
                    className="mb-2 flex h-12 items-center gap-1 overflow-hidden rounded-lg p-1.5"
                    style={{ background: p.theme.bg }}
                  >
                    <span className="h-full w-2 rounded" style={{ background: p.theme.primary }} />
                    <span className="h-full w-2 rounded" style={{ background: p.theme.accent }} />
                    <span
                      className="h-full flex-1 rounded"
                      style={{ background: p.theme.surface, border: `1px solid ${p.theme.border}` }}
                    />
                  </div>
                  <span className="text-xs font-semibold">{p.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Modo */}
        <section className="flex items-center justify-between rounded-2xl border border-border bg-surface p-3">
          <div>
            <p className="text-sm font-semibold">Esquema base</p>
            <p className="text-xs text-muted">Afecta menús del sistema (color-scheme).</p>
          </div>
          <div className="flex gap-1 rounded-xl bg-surface-2 p-1">
            {(["dark", "light"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTheme((t) => ({ ...t, mode: m }))}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  theme.mode === m ? "bg-primary text-white" : "text-muted"
                )}
              >
                {m === "dark" ? "🌙 Oscuro" : "☀️ Claro"}
              </button>
            ))}
          </div>
        </section>

        {/* Colores agrupados */}
        <section className="space-y-5">
          <h2 className="text-sm font-semibold">2. Ajusta los colores</h2>
          {THEME_GROUPS.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-medium">{group.title}</p>
              <p className="mb-2 text-xs text-muted">{group.hint}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {group.keys.map((key) => {
                  const value = theme[key];
                  const valid = HEX.test(value);
                  return (
                    <div
                      key={key}
                      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-2.5"
                    >
                      <label className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border">
                        <span className="absolute inset-0" style={{ background: valid ? value : "#000" }} />
                        <input
                          type="color"
                          value={valid ? value : "#000000"}
                          onChange={(e) => setField(key, e.target.value)}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          aria-label={TOKEN_LABELS[key]}
                        />
                      </label>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{TOKEN_LABELS[key]}</p>
                        <input
                          value={value}
                          onChange={(e) => setField(key, e.target.value)}
                          spellCheck={false}
                          className={cn(
                            "mt-0.5 w-24 rounded-md border bg-surface-2 px-2 py-0.5 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-primary/30",
                            valid ? "border-border" : "border-danger"
                          )}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* ── Vista previa (sticky en desktop, arriba en móvil) ── */}
      <aside className="lg:order-2">
        <div className="lg:sticky lg:top-6">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-muted">
            Vista previa en vivo
          </p>
          <ThemePreview theme={theme} />

          {/* Acciones */}
          <div className="mt-5 space-y-2">
            <Button onClick={save} disabled={pending || !dirty} className="w-full">
              {pending ? "Guardando…" : dirty ? "Guardar y aplicar a todos" : "Sin cambios"}
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setTheme({ ...DEFAULT_THEME })}
                disabled={pending}
                className="flex-1"
              >
                Restablecer
              </Button>
              <Button
                variant="ghost"
                onClick={() => setTheme({ ...initial })}
                disabled={pending || !dirty}
                className="flex-1"
              >
                Descartar
              </Button>
            </div>
          </div>
          <p className="mt-3 text-center text-[11px] text-muted">
            Al guardar, el tema se aplica a clientes y administradores.
          </p>
        </div>
      </aside>
    </div>
  );
}
