"use client";

import { useEffect, useRef } from "react";
import { getSessionId } from "@/lib/session";
import { logProductViewAction } from "@/actions/metrics";

/** Registra una vista de producto una sola vez al montar. */
export function ViewTracker({ productId }: { productId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void logProductViewAction(productId, getSessionId());
  }, [productId]);

  return null;
}
