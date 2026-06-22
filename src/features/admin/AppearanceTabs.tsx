"use client";

import { useState } from "react";
import type { Theme } from "@/lib/theme";
import type { HeroConfig } from "@/lib/hero";
import { ThemeEditor } from "@/features/admin/ThemeEditor";
import { HeroEditor } from "@/features/admin/HeroEditor";
import { cn } from "@/lib/utils";

type Tab = "tema" | "portada";

export function AppearanceTabs({ theme, hero }: { theme: Theme; hero: HeroConfig }) {
  const [tab, setTab] = useState<Tab>("tema");

  const tabs: { id: Tab; label: string }[] = [
    { id: "tema", label: "🎨 Tema (colores)" },
    { id: "portada", label: "🖼️ Portada del inicio" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              tab === t.id ? "bg-primary text-white" : "text-muted hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "tema" ? <ThemeEditor initial={theme} /> : <HeroEditor initial={hero} />}
    </div>
  );
}
