"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Varias paletas para que el estallido no sea siempre igual.
const PALETTES = [
  ["❤️", "✨", "🌸", "💖"],
  ["⭐", "🌟", "✨", "💫"],
  ["🎌", "🔥", "⚡", "✨"],
  ["🥳", "🎉", "✨", "💖"],
  ["🌸", "🌺", "💮", "✨"],
];

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

/**
 * Estalla emojis flotando hacia arriba cada vez que `trigger` incrementa.
 * `big` = más partículas y dispersión (para celebraciones como el checkout).
 */
export function EmojiBurst({ trigger, big = false }: { trigger: number; big?: boolean }) {
  const [bursts, setBursts] = useState<{ id: number; particles: Particle[] }[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)];
    const count = big ? 14 : 7;
    const spread = big ? 200 : 120;
    const lift = big ? 110 : 70;
    const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: palette[Math.floor(Math.random() * palette.length)],
      x: (Math.random() - 0.5) * spread,
      y: -50 - Math.random() * lift,
      rotate: (Math.random() - 0.5) * 90,
      scale: 0.75 + Math.random() * 0.7,
    }));
    const id = trigger;
    setBursts((b) => [...b, { id, particles }]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1200);
    return () => clearTimeout(t);
  }, [trigger, big]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {bursts.map((burst) =>
          burst.particles.map((p) => (
            <motion.span
              key={`${burst.id}-${p.id}`}
              className={big ? "absolute text-2xl" : "absolute text-xl"}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, scale: p.scale, rotate: p.rotate }}
              exit={{ opacity: 0 }}
              transition={{ duration: big ? 1.15 : 1, ease: "easeOut" }}
              aria-hidden="true"
            >
              {p.emoji}
            </motion.span>
          ))
        )}
      </AnimatePresence>
    </div>
  );
}
