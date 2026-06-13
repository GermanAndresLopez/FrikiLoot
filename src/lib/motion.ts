import type { Variants, Transition } from "framer-motion";

/** Curva de easing tipo "premium" (suave con salida elegante). */
export const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOutExpo } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: easeOutExpo } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: easeOutExpo } },
};

/** Contenedor que escalona la aparición de sus hijos. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

/** Transición estándar para cambios de página. */
export const pageTransition: Transition = { duration: 0.35, ease: easeOutExpo };
