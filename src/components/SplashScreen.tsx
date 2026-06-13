"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { env } from "@/lib/env";

const SESSION_KEY = "frikiloot-splash-shown";

/**
 * Splash de carga con animación del logo, centrado.
 * Se muestra una vez por sesión del navegador y se desvanece solo.
 * Respeta `prefers-reduced-motion`.
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const already = sessionStorage.getItem(SESSION_KEY);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (already || reduce) return;

    setVisible(true);
    sessionStorage.setItem(SESSION_KEY, "1");
    const t = setTimeout(() => setVisible(false), 1700);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-bg"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
          aria-hidden="true"
        >
          {/* Halo de marca */}
          <motion.div
            className="absolute h-64 w-64 rounded-full bg-primary/20 blur-3xl"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: [0.6, 1.1, 1], opacity: [0, 0.8, 0.5] }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          />

          {/* Logo */}
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0, rotate: -8 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 16 }}
          >
            <Image
              src="/logo.jpg"
              alt={env.storeName}
              width={96}
              height={96}
              priority
              className="h-24 w-24 rounded-2xl bg-white shadow-2xl shadow-primary/30"
            />
          </motion.div>

          <motion.p
            className="mt-6 text-lg font-extrabold tracking-wide text-brand-gradient"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            {env.storeName}
          </motion.p>

          {/* Barra de carga */}
          <motion.div className="mt-5 h-1 w-32 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full bg-brand-gradient"
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
