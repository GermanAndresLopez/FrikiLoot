import Link from "next/link";
import Image from "next/image";
import { env } from "@/lib/env";

/**
 * Pie de la tienda. Incluye un acceso DISCRETO al panel administrativo:
 * el logo enlaza a /admin/login (sin texto llamativo).
 */
export function ShopFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-border/60 pb-28 pt-10 md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center">
        {/* Acceso discreto al admin */}
        <Link
          href="/admin/login"
          aria-label="Acceso administrativo"
          title="Acceso administrativo"
          className="group inline-flex items-center justify-center rounded-xl p-1 opacity-50 transition-all duration-300 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Image
            src="/logo.jpg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg bg-white grayscale transition-all duration-300 group-hover:grayscale-0 group-hover:scale-105"
          />
        </Link>

        <p className="text-sm font-semibold text-foreground">{env.storeName}</p>
        <p className="max-w-xs text-xs text-muted">
          Merch de anime con envío y pedidos por WhatsApp.
        </p>
        <p className="mt-2 text-[11px] text-muted/70">© {year} {env.storeName}</p>
      </div>
    </footer>
  );
}
