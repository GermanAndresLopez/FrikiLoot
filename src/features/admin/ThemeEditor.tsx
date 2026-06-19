"use client";

import { useEffect, useState, useTransition } from "react";
import { THEME_TOKENS, PRESETS, DEFAULT_THEME, type Theme } from "@/lib/theme";
import { saveThemeAction } from "@/actions/theme";
import { toast } from "@/store/toastStore";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Aplica el tema en vivo a <html> (preview inmediato para todo el panel). */
function applyLive(t: Theme) {
  const root = document.documentElement;
  for (const { key, cssVar } of THEME_TOKENS) root.style.setProperty(cssVar, t[key]);
  root.style.setProperty("color-scheme", t.mode);
}

export function ThemeEditor({ initial }: { initial: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial);
  const [pending, startTransition] = useTransition();

  // Preview en vivo mientras edita.
  useEffect(() => {
    applyLive(theme);
  }, [theme]);

  // Al salir sin guardar, quita los overrides → vuelve al tema guardado (SSR).
  useEffect(() => {
    return () => {
      const root = document.documentElement;
      for (const { cssVar } of THEME_TOKENS) root.style.removeProperty(cssVar);
      root.style.removeProperty("color-scheme");
    };
  }, []);

  function setField(key: keyof Omit<Theme, "mode">, value: string) {
    setTheme((t) => ({ ...t, [key]: value }));
  }

  function save() {
    startTransition(async () => {
      const res = await saveThemeAction(theme);
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Tema guardado y aplicado a toda la tienda");
    });
  }

  return (
    <div className="space-y-6">
      {/* Presets */}
      <section>
        <h2 className="mb-2 text-sm font-semibold text-muted">Temas predeterminados</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setTheme({ ...p.theme })}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <span className="flex gap-1">
                <span className="h-4 w-4 rounded-full" style={{ background: p.theme.primary }} />
                <span className="h-4 w-4 rounded-full" style={{ background: p.theme.bg }} />
                <span className="h-4 w-4 rounded-full border border-border" style={{ background: p.theme.surface }} />
              </span>
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {/* Modo claro/oscuro */}
      <section className="flex items-center gap-3">
        <span className="text-sm font-semibold text-muted">Esquema:</span>
        {(["dark", "light"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setTheme((t) => ({ ...t, mode: m }))}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
              theme.mode === m ? "border-primary bg-primary/15 text-primary" : "border-border text-muted"
            )}
          >
            {m === "dark" ? "Oscuro" : "Claro"}
          </button>
        ))}
      </section>

      {/* Editor de colores */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-muted">Colores</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {THEME_TOKENS.map(({ key, label }) => {
            const value = theme[key];
            const valid = HEX.test(value);
            return (
              <div key={key} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
                <label className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border">
                  <span className="absolute inset-0" style={{ background: valid ? value : "#000" }} />
                  <input
                    type="color"
                    value={valid ? value : "#000000"}
                    onChange={(e) => setField(key, e.target.value)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label={label}
                  />
                </label>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{label}</p>
                  <input
                    value={value}
                    onChange={(e) => setField(key, e.target.value)}
                    spellCheck={false}
                    className={cn(
                      "mt-0.5 w-28 rounded-md border bg-surface-2 px-2 py-1 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-primary/30",
                      valid ? "border-border" : "border-danger"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Acciones */}
      <div className="sticky bottom-20 z-10 flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/90 p-3 backdrop-blur md:bottom-4">
        <Button onClick={save} disabled={pending}>
          {pending ? "Guardando…" : "Guardar y aplicar"}
        </Button>
        <Button variant="outline" onClick={() => setTheme({ ...DEFAULT_THEME })} disabled={pending}>
          Restablecer marca
        </Button>
        <Button variant="ghost" onClick={() => setTheme({ ...initial })} disabled={pending}>
          Descartar cambios
        </Button>
      </div>
      <p className="text-xs text-muted">
        Los cambios se previsualizan al instante. Al <strong>Guardar</strong>, el tema queda global para
        todos (administradores y clientes).
      </p>
    </div>
  );
}
