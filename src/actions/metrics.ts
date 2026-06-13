"use server";

import { metricsService } from "@/services/metricsService";

/** Registra una vista de producto (llamado desde el cliente con el sessionId). */
export async function logProductViewAction(productId: string, sessionId: string): Promise<void> {
  await metricsService.logProductView(productId, sessionId || null);
}

/** Registra un evento de carrito. */
export async function logCartEventAction(args: {
  productId: string;
  size: string | null;
  quantity: number;
  eventType: "add" | "remove" | "update";
  sessionId: string;
}): Promise<void> {
  await metricsService.logCartEvent({
    productId: args.productId,
    size: args.size,
    quantity: args.quantity,
    eventType: args.eventType,
    sessionId: args.sessionId || null,
  });
}
