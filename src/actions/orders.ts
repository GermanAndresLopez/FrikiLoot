"use server";

import { revalidatePath } from "next/cache";
import { checkoutSchema } from "@/validations/order";
import { metricsService } from "@/services/metricsService";
import { buildWhatsappMessage, buildWhatsappUrl } from "@/services/whatsapp";
import { requireAdmin } from "@/services/authService";
import { adminProductRepository } from "@/repositories/adminProductRepository";
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

/**
 * Confirma (o cancela) un pedido desde el panel. Si se confirma, descuenta el
 * stock de cada producto una sola vez (stock_applied evita doble descuento).
 */
export async function fulfillOrderAction(orderId: string, completed: boolean): Promise<void> {
  const { supabase } = await requireAdmin();

  const { data: order } = await supabase
    .from("whatsapp_orders")
    .select("items, stock_applied")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return;

  if (completed) {
    if (!order.stock_applied) {
      for (const it of order.items as OrderItemSnapshot[]) {
        try {
          if (it.size) {
            await adminProductRepository.adjustSizeStock(supabase, it.product_id, it.size, -it.quantity);
          } else {
            await adminProductRepository.adjustStock(supabase, it.product_id, -it.quantity);
          }
        } catch (e) {
          console.error("[fulfill] descuento de stock", e);
        }
      }
    }
    await supabase
      .from("whatsapp_orders")
      .update({ status: "completed", stock_applied: true })
      .eq("id", orderId);
  } else {
    await supabase.from("whatsapp_orders").update({ status: "cancelled" }).eq("id", orderId);
  }

  revalidatePath("/admin/notificaciones");
  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
}
