"use server";

import { checkoutSchema } from "@/validations/order";
import { metricsService } from "@/services/metricsService";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/services/whatsapp";
import type { OrderItemSnapshot } from "@/types/database";

export interface CheckoutResult {
  url?: string;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Valida el pedido, lo registra (whatsapp_orders → dispara notificación)
 * y devuelve la URL de WhatsApp lista para abrir.
 */
export async function checkoutAction(raw: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path.join(".")] = issue.message;
    return { error: "Revisa los datos del pedido.", fieldErrors };
  }

  const { items, total, customer_name, customer_phone, session_id } = parsed.data;

  const snapshot: OrderItemSnapshot[] = items.map((it) => ({
    product_id: it.product_id,
    name: it.name,
    size: it.size,
    quantity: it.quantity,
    unit_price: it.unit_price,
  }));

  try {
    await metricsService.logOrder({
      items: snapshot,
      total,
      customerName: customer_name,
      customerPhone: customer_phone,
      sessionId: session_id ?? null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "No se pudo registrar el pedido." };
  }

  const message = buildWhatsappMessage({
    items,
    total,
    customerName: customer_name,
    customerPhone: customer_phone,
  });

  return { url: buildWhatsappUrl(message) };
}
