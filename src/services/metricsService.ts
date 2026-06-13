import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderItemSnapshot } from "@/types/database";

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
  },
};
