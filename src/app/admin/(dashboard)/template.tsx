"use client";

import { motion } from "framer-motion";
import { pageTransition } from "@/lib/motion";

export default function AdminTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );
}
