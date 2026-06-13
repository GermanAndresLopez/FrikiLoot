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

export const orderRepository = {
  async listRecent(db: DB, limit = 20): Promise<OrderRow[]> {
    const { data, error } = await db
      .from("whatsapp_orders")
      .select("id, items, total, customer_name, customer_phone, status, stock_applied, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as OrderRow[];
  },
};
