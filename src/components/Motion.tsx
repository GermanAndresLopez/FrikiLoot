"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { fadeInUp, staggerContainer } from "@/lib/motion";

/** Aparece al entrar en viewport (una sola vez). Ideal para secciones. */
export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li";
}) {
  const Comp = motion[as] as React.ElementType;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={fadeInUp}
      transition={{ delay }}
    >
      {children}
    </Comp>
  );
}

/** Contenedor que escalona la aparición de sus hijos al entrar en viewport. */
export function StaggerGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

/** Hijo de StaggerGrid. */
export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={fadeInUp}>
      {children}
    </motion.div>
  );
}

/** Wrapper genérico con props de motion. */
export function MotionDiv(props: HTMLMotionProps<"div">) {
  return <motion.div {...props} />;
}
