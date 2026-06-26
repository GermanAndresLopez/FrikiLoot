import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, OrderItemSnapshot, OrderStatus } from "@/types/database";

type DB = SupabaseClient<Database>;

export interface OrderRow {
  id: string;
  items: OrderItemSnapshot[];
  total: number;
  customer_name: string | null;
  customer_phone: string | null;
  status: OrderStatus;
  stock_applied: boolean;
  created_at: string;
}

const SELECT = "id, items, total, customer_name, customer_phone, status, stock_applied, created_at";

export const orderRepository = {
  async listRecent(db: DB, limit = 20): Promise<OrderRow[]> {
    const { data, error } = await db
      .from("whatsapp_orders")
      .select(SELECT)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as OrderRow[];
  },

  /** Solo pedidos por confirmar (los resueltos no se acumulan en Alertas). */
  async listPending(db: DB, limit = 50): Promise<OrderRow[]> {
    const { data, error } = await db
      .from("whatsapp_orders")
      .select(SELECT)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as OrderRow[];
  },

  /** Pedidos resueltos (completados + cancelados) para el historial. */
  async listResolved(db: DB, limit = 100): Promise<OrderRow[]> {
    const { data, error } = await db
      .from("whatsapp_orders")
      .select(SELECT)
      .in("status", ["completed", "cancelled"])
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as OrderRow[];
  },
};
