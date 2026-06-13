import { z } from "zod";

export const orderItemSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string(),
  size: z.string().nullable(),
  quantity: z.number().int().min(1),
  unit_price: z.number().int().min(0),
});

export const checkoutSchema = z.object({
  items: z.array(orderItemSchema).min(1, "El carrito está vacío"),
  total: z.number().int().min(0),
  customer_name: z.string().min(2, "Ingresa tu nombre").max(80),
  customer_phone: z
    .string()
    .min(7, "Teléfono inválido")
    .max(20)
    .regex(/^[0-9+\s-]+$/, "Solo números"),
  session_id: z.string().optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type OrderItemInput = z.infer<typeof orderItemSchema>;
