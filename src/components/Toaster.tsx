"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useToastStore, type ToastType } from "@/store/toastStore";
import { cn } from "@/lib/utils";

const styles: Record<ToastType, { ring: string; icon: string; iconBg: string }> = {
  success: { ring: "border-success/40", icon: "✓", iconBg: "bg-success/20 text-success" },
  error: { ring: "border-danger/40", icon: "!", iconBg: "bg-danger/20 text-danger" },
  info: { ring: "border-accent/40", icon: "i", iconBg: "bg-accent/20 text-accent" },
};

/** Contenedor global de notificaciones efímeras (toasts). */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-3 z-[120] flex flex-col items-center gap-2 px-4"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const s = styles[t.type];
          return (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => dismiss(t.id)}
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-surface/95 px-4 py-3 text-left text-sm shadow-2xl backdrop-blur-xl",
                s.ring
              )}
            >
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold", s.iconBg)}>
                {s.icon}
              </span>
              <span className="flex-1 font-medium text-foreground">{t.message}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
