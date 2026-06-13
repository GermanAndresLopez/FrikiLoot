"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { logoutAction } from "@/actions/auth";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";

type IconProps = React.SVGProps<SVGSVGElement>;

const links = [
  { href: "/admin", label: "Dashboard", exact: true, icon: DashboardIcon },
  { href: "/admin/notificaciones", label: "Alertas", icon: BellIcon },
  { href: "/admin/productos", label: "Productos", icon: BoxIcon },
  { href: "/admin/inventario", label: "Inventario", icon: StackIcon },
  { href: "/admin/categorias", label: "Categorías", icon: TagIcon },
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ───────── Sidebar desktop ───────── */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface/70 p-4 backdrop-blur-xl md:flex">
        <Link
          href="/admin"
          className="mb-8 flex items-center gap-2.5 rounded-xl px-2 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Image src="/logo.jpg" alt="" width={32} height={32} className="h-8 w-8 rounded-lg bg-white" />
          <span className="text-lg font-extrabold text-brand-gradient">{env.storeName}</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1" aria-label="Navegación del panel">
          {links.map(({ href, label, exact, icon: Icon }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  active ? "text-primary" : "text-muted hover:bg-surface-2 hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="admin-active-pill"
                    className="absolute inset-0 -z-10 rounded-xl bg-primary/15"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 space-y-1 border-t border-border pt-4">
          <p className="truncate px-3 text-xs text-muted" title={email}>
            {email}
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <StoreIcon className="h-4 w-4" /> Ver tienda
          </Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-danger transition-colors hover:bg-danger/10">
              <LogoutIcon className="h-4 w-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* ───────── Top bar móvil ───────── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface/85 px-4 py-3 backdrop-blur-xl md:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="" width={26} height={26} className="h-[26px] w-[26px] rounded-md bg-white" />
          <span className="text-base font-extrabold text-brand-gradient">{env.storeName}</span>
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            aria-label="Ver tienda"
            className="rounded-lg p-2 text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
          >
            <StoreIcon className="h-5 w-5" />
          </Link>
          <form action={logoutAction}>
            <button aria-label="Cerrar sesión" className="rounded-lg p-2 text-danger transition-colors hover:bg-danger/10">
              <LogoutIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>

      {/* ───────── Bottom bar móvil ───────── */}
      <nav
        aria-label="Navegación del panel"
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        {links.map(({ href, label, exact, icon: Icon }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted"
              )}
            >
              {active && (
                <motion.span
                  layoutId="admin-active-bottom"
                  className="absolute -top-px h-0.5 w-10 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}

/* ───────── Iconos ───────── */
function base(props: IconProps) {
  return { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...props };
}
function DashboardIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  );
}
function BoxIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </svg>
  );
}
function TagIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 11V5a2 2 0 0 1 2-2h6l9 9-8 8-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
function StackIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </svg>
  );
}
function BellIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}
function StoreIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M3 9 4.5 4h15L21 9M4 9v11h16V9M4 9h16" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
function LogoutIcon(p: IconProps) {
  return (
    <svg {...base(p)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}
