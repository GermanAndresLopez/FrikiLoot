"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { env } from "@/lib/env";
import { useCartCount } from "@/store/cartStore";

export function ShopHeader() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const count = useCartCount();

  // Prefill desde la URL sin useSearchParams (evita forzar dynamic en el layout).
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setQ(sp.get("q") ?? "");
  }, []);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (q.trim()) sp.set("q", q.trim());
    router.push(`/productos${sp.toString() ? `?${sp}` : ""}`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.jpg"
            alt={env.storeName}
            width={32}
            height={32}
            priority
            className="h-8 w-8 rounded-lg bg-white"
          />
          <span className="hidden text-lg font-extrabold text-brand-gradient sm:inline">
            {env.storeName}
          </span>
        </Link>

        {/* Enlaces de escritorio (en móvil está la BottomNav) */}
        <nav className="hidden shrink-0 items-center gap-1 md:flex">
          <Link href="/productos" className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground">
            Catálogo
          </Link>
          <Link href="/noticias" className="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground">
            Noticias
          </Link>
        </nav>

        <form onSubmit={onSearch} className="flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            type="search"
            placeholder="Buscar productos…"
            aria-label="Buscar"
            className="h-10 w-full rounded-full border border-border bg-surface px-4 text-sm placeholder:text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </form>

        {/* Carrito (visible en desktop; en móvil está la BottomNav) */}
        <Link href="/carrito" className="relative hidden shrink-0 p-2 md:block" aria-label="Carrito">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M3 4h2l2.4 12.2a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="20" r="1.4" />
            <circle cx="18" cy="20" r="1.4" />
          </svg>
          {count > 0 && (
            <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
