import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItemSnapshot } from "@/types/database";

/** Pesos de popularidad: una compra vale más que un add, y un add más que una vista. */
const POPULARITY = { view: 1, cartAdd: 2, order: 5 } as const;

async function bumpPopularity(productId: string, amount: number) {
  try {
    const db = createAdminClient();
    await db.rpc("bump_popularity", { p_id: productId, p_amount: amount });
  } catch (err) {
    console.error("[metrics] bumpPopularity", err);
  }
}

/**
 * Registro de eventos de analítica.
 * Usa el cliente service-role para insertar sin exponer escritura a anon
 * (RLS prohíbe inserts públicos en estas tablas).
 * Las fallas se silencian: la analítica nunca debe romper la UX.
 */
export const metricsService = {
  async logProductView(productId: string, sessionId: string | null): Promise<void> {
    try {
      const db = createAdminClient();
      await db.from("product_views").insert({ product_id: productId, session_id: sessionId });
      await bumpPopularity(productId, POPULARITY.view);
    } catch (err) {
      console.error("[metrics] logProductView", err);
    }
  },

  async logCartEvent(args: {
    productId: string;
    size: string | null;
    quantity: number;
    eventType: "add" | "remove" | "update";
    sessionId: string | null;
  }): Promise<void> {
    try {
      const db = createAdminClient();
      await db.from("cart_events").insert({
        product_id: args.productId,
        size: args.size,
        quantity: args.quantity,
        event_type: args.eventType,
        session_id: args.sessionId,
      });
      if (args.eventType === "add") await bumpPopularity(args.productId, POPULARITY.cartAdd);
    } catch (err) {
      console.error("[metrics] logCartEvent", err);
    }
  },

  async logOrder(args: {
    items: OrderItemSnapshot[];
    total: number;
    customerName: string | null;
    customerPhone: string | null;
    sessionId: string | null;
  }): Promise<void> {
    // Aquí NO silenciamos: el pedido es dato de negocio. El trigger crea la notificación.
    const db = createAdminClient();
    const { error } = await db.from("whatsapp_orders").insert({
      items: args.items,
      total: args.total,
      customer_name: args.customerName,
      customer_phone: args.customerPhone,
      session_id: args.sessionId,
    });
    if (error) throw error;

    // Sube popularidad por cada producto del pedido (compra > add > vista).
    await Promise.all(
      args.items.map((it) => bumpPopularity(it.product_id, POPULARITY.order * it.quantity))
    );
  },
};
