"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const EMOJIS = ["❤️", "✨", "🌸", "⭐", "🎌", "💖", "🌟"];

interface Particle {
  id: number;
  emoji: string;
  x: number; // desplazamiento horizontal final (px)
  y: number; // desplazamiento vertical final (px, negativo = arriba)
  rotate: number;
  scale: number;
}

/**
 * Estalla un puñado de emojis flotando hacia arriba cada vez que `trigger`
 * cambia (incrementa). Anclado al contenedor relativo padre.
 */
export function EmojiBurst({ trigger }: { trigger: number }) {
  const [bursts, setBursts] = useState<{ id: number; particles: Particle[] }[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const count = 7;
    const particles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
      x: (Math.random() - 0.5) * 120,
      y: -60 - Math.random() * 70,
      rotate: (Math.random() - 0.5) * 80,
      scale: 0.8 + Math.random() * 0.6,
    }));
    const id = trigger;
    setBursts((b) => [...b, { id, particles }]);
    const t = setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1100);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-visible">
      <AnimatePresence>
        {bursts.map((burst) =>
          burst.particles.map((p) => (
            <motion.span
              key={`${burst.id}-${p.id}`}
              className="absolute text-xl"
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, scale: p.scale, rotate: p.rotate }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
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
