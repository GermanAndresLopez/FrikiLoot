"use client";

import type { Theme } from "@/lib/theme";

/** Convierte #rrggbb + alpha a rgba() para tintes (badges, etc.). */
function withAlpha(hex: string, a: number): string {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/**
 * Maqueta de la tienda que refleja el tema en vivo (estilos en línea).
 * Permite ver el efecto real sin tocar el resto del panel.
 */
export function ThemePreview({ theme: t }: { theme: Theme }) {
  const gradient = `linear-gradient(135deg, ${t.primary}, ${t.accent})`;

  return (
    <div
      className="mx-auto w-full max-w-[300px] overflow-hidden rounded-[2rem] border-4 shadow-2xl"
      style={{ borderColor: t.surface2, background: t.bg, color: t.foreground }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: t.surface, borderBottom: `1px solid ${t.border}` }}
      >
        <span
          className="text-base font-extrabold"
          style={{ backgroundImage: gradient, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
        >
          FrikiLoot
        </span>
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs"
          style={{ background: t.surface2, color: t.muted }}
        >
          🛒
        </span>
      </div>

      {/* Cuerpo */}
      <div className="space-y-3 p-4">
        {/* Hero / CTA */}
        <div className="rounded-2xl p-3 text-center" style={{ background: withAlpha(t.primary, 0.12) }}>
          <p className="text-sm font-bold" style={{ color: t.foreground }}>
            Tu universo anime
          </p>
          <button
            className="mt-2 rounded-lg px-4 py-1.5 text-xs font-semibold"
            style={{ background: t.primary, color: "#fff" }}
          >
            Ver catálogo →
          </button>
        </div>

        {/* Tarjeta de producto */}
        <div className="overflow-hidden rounded-2xl" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <div className="relative flex h-20 items-center justify-center text-3xl" style={{ background: t.surface2 }}>
            🎴
            <span
              className="absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: withAlpha(t.primary, 0.18), color: t.primary }}
            >
              Destacado
            </span>
          </div>
          <div className="space-y-1 p-2.5">
            <p className="text-[11px]" style={{ color: t.muted }}>
              Suéteres
            </p>
            <p className="text-sm font-semibold" style={{ color: t.foreground }}>
              Suéter Naruto
            </p>
            <p className="text-sm font-bold" style={{ color: t.primary }}>
              $120.000
            </p>
            <button
              className="mt-1 w-full rounded-lg py-1.5 text-xs font-semibold"
              style={{ background: t.primary, color: "#fff" }}
            >
              Agregar al carrito
            </button>
          </div>
        </div>

        {/* Estados */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { c: t.success, l: "En stock" },
            { c: t.warning, l: "Stock bajo" },
            { c: t.danger, l: "Agotado" },
            { c: t.accent2, l: "Acento" },
          ].map((s) => (
            <span
              key={s.l}
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{ background: withAlpha(s.c, 0.15), color: s.c }}
            >
              {s.l}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
