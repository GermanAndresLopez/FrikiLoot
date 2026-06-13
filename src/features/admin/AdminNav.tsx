"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/inventario", label: "Inventario" },
  { href: "/admin/notificaciones", label: "Notificaciones" },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface p-4 md:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2 px-2">
          <Image src="/logo.jpg" alt="" width={28} height={28} className="h-7 w-7 rounded-md bg-white" />
          <span className="text-lg font-extrabold text-brand-gradient">{env.storeName}</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(l.href, l.exact)
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-border pt-4">
          <p className="truncate px-3 text-xs text-muted">{email}</p>
          <Link href="/" className="block px-3 py-1.5 text-xs text-muted hover:text-foreground">
            ← Ver tienda
          </Link>
          <form action={logoutAction}>
            <button className="px-3 py-1.5 text-xs text-danger hover:underline">Cerrar sesión</button>
          </form>
        </div>
      </aside>

      {/* Top bar móvil */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="" width={24} height={24} className="h-6 w-6 rounded-md bg-white" />
          <span className="text-base font-extrabold text-brand-gradient">{env.storeName}</span>
        </Link>
        <form action={logoutAction}>
          <button className="text-xs text-danger">Salir</button>
        </form>
      </header>

      {/* Nav inferior móvil */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/95 backdrop-blur md:hidden">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "flex-1 py-2.5 text-center text-[10px] font-medium",
              isActive(l.href, l.exact) ? "text-primary" : "text-muted"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
