"use client";

import { SESSION_STORAGE_KEY } from "@/lib/constants";

/**
 * Identificador de sesión anónimo y persistente (localStorage) para
 * atribuir eventos de analítica sin requerir login ni cookies de tracking.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}
