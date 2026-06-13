import { formatCOP } from "@/lib/format";
import { env } from "@/lib/env";
import type { OrderItemInput } from "@/validations/order";

interface BuildMessageArgs {
  items: OrderItemInput[];
  total: number;
  customerName: string;
  customerPhone: string;
}

/**
 * Construye el texto del pedido para WhatsApp.
 * Función pura: testeable sin red ni dependencias de framework.
 */
export function buildWhatsappMessage({ items, total, customerName, customerPhone }: BuildMessageArgs): string {
  const lines = [
    `¡Hola ${env.storeName}! 🛍️ Deseo realizar el siguiente pedido:`,
    "",
    ...items.map((it) => {
      const sizeLabel = it.size ? ` (Talla ${it.size})` : "";
      return [
        `• ${it.name}${sizeLabel}`,
        `  Cantidad: ${it.quantity}`,
        `  Precio: ${formatCOP(it.unit_price)}`,
        `  Subtotal: ${formatCOP(it.unit_price * it.quantity)}`,
      ].join("\n");
    }),
    "",
    `*Total: ${formatCOP(total)}*`,
    "",
    `Nombre: ${customerName}`,
    `Teléfono: ${customerPhone}`,
  ];
  return lines.join("\n");
}

/** Genera la URL wa.me lista para abrir. */
export function buildWhatsappUrl(message: string): string {
  return `https://wa.me/${env.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
