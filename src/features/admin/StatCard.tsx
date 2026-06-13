"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type Tone = "default" | "danger" | "warning" | "accent";

const toneText: Record<Tone, string> = {
  default: "text-foreground",
  danger: "text-danger",
  warning: "text-warning",
  accent: "text-accent",
};
const toneBar: Record<Tone, string> = {
  default: "bg-primary/40",
  danger: "bg-danger",
  warning: "bg-warning",
  accent: "bg-accent",
};

/** Tarjeta de métrica con conteo animado y hover sutil. */
export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: Tone;
}) {
  const numeric = typeof value === "number";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4"
    >
      <span className={cn("absolute inset-x-0 top-0 h-0.5", toneBar[tone])} />
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", toneText[tone])}>
        {numeric ? <CountUp value={value as number} /> : value}
      </p>
    </motion.div>
  );
}

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (value === 0) return setDisplay(0);
    const duration = 700;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}
