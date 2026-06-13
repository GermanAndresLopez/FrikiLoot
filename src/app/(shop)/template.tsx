"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

/** template.tsx se remonta en cada navegación → transición suave entre páginas. */
export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
