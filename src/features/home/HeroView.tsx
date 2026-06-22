import Link from "next/link";
import Image from "next/image";
import { env } from "@/lib/env";
import type { HeroConfig } from "@/lib/hero";

/**
 * Zona "hero" del inicio, editable por el admin.
 * Sin "use client": se usa en la home (servidor) y en la vista previa (cliente).
 * En modo `preview` los botones no navegan.
 */
export function HeroView({ config, preview = false }: { config: HeroConfig; preview?: boolean }) {
  const hasImages = config.images.length > 0;

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60">
      {/* Glows de fondo */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-accent-2/30 blur-3xl" />

      <div className="relative flex flex-col items-center gap-5 bg-surface/40 px-6 py-12 text-center backdrop-blur-sm sm:py-16">
        {/* Imágenes (o logo por defecto) */}
        {hasImages ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            {config.images.map((src, i) => (
              <div key={i} className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white/5 shadow-lg sm:h-24 sm:w-24">
                <Image src={src} alt="" fill sizes="96px" className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <Image
            src="/logo.jpg"
            alt={env.storeName}
            width={72}
            height={72}
            priority={!preview}
            className="h-[72px] w-[72px] rounded-2xl bg-white shadow-xl shadow-primary/20"
          />
        )}

        <div>
          {config.title && (
            <h1 className="whitespace-pre-line text-3xl font-extrabold leading-tight sm:text-5xl">
              {config.titleGradient ? (
                <span className="text-brand-gradient">{config.title}</span>
              ) : (
                <span style={{ color: config.titleColor }}>{config.title}</span>
              )}
            </h1>
          )}
          {config.subtitle && (
            <p className="mx-auto mt-3 max-w-md text-sm sm:text-base" style={{ color: config.subtitleColor }}>
              {config.subtitle}
            </p>
          )}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {preview ? (
            <>
              <span className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-white shadow-lg shadow-primary/30">
                Ver catálogo →
              </span>
              <span className="inline-flex h-12 items-center rounded-xl border border-border bg-surface/60 px-7 text-sm font-semibold text-foreground">
                Ver destacados
              </span>
            </>
          ) : (
            <>
              <Link
                href="/productos"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-hover hover:shadow-primary/40 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Ver catálogo
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="#destacados"
                className="inline-flex h-12 items-center rounded-xl border border-border bg-surface/60 px-7 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                Ver destacados
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
