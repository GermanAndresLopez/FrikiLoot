import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ConversionFunnel, DailyTraffic, ProductMetric } from "@/types/domain";

type DB = SupabaseClient<Database>;

export interface DashboardSummary {
  totalProducts: number;
  totalCategories: number;
  outOfStock: number;
  lowStock: number;
  visitsToday: number;
  visitsMonth: number;
}

export interface SalesSummary {
  salesCount: number;
  revenue: number;
  salesMonth: number;
  revenueMonth: number;
}

export const metricsRepository = {
  /** Ventas e ingresos a partir de pedidos confirmados (status = 'completed'). */
  async salesSummary(db: DB): Promise<SalesSummary> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data, error } = await db
      .from("whatsapp_orders")
      .select("total, created_at")
      .eq("status", "completed");
    if (error) throw error;

    const rows = data ?? [];
    let revenue = 0;
    let revenueMonth = 0;
    let salesMonth = 0;
    for (const r of rows) {
      revenue += r.total;
      if (new Date(r.created_at) >= startOfMonth) {
        revenueMonth += r.total;
        salesMonth += 1;
      }
    }
    return { salesCount: rows.length, revenue, salesMonth, revenueMonth };
  },

  async summary(db: DB, lowStockThreshold: number): Promise<DashboardSummary> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [products, categories, out, low, today, month] = await Promise.all([
      db.from("products").select("id", { count: "exact", head: true }),
      db.from("categories").select("id", { count: "exact", head: true }),
      db.from("products").select("id", { count: "exact", head: true }).eq("stock", 0),
      db
        .from("products")
        .select("id", { count: "exact", head: true })
        .gt("stock", 0)
        .lte("stock", lowStockThreshold),
      db
        .from("product_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfDay.toISOString()),
      db
        .from("product_views")
        .select("id", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString()),
    ]);

    return {
      totalProducts: products.count ?? 0,
      totalCategories: categories.count ?? 0,
      outOfStock: out.count ?? 0,
      lowStock: low.count ?? 0,
      visitsToday: today.count ?? 0,
      visitsMonth: month.count ?? 0,
    };
  },

  async topProducts(db: DB, by: "views" | "cart_adds" | "whatsapp_sends", limit = 5): Promise<ProductMetric[]> {
    const { data, error } = await db
      .from("product_metrics")
      .select("*")
      .order(by, { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async dailyTraffic(db: DB, days = 30): Promise<DailyTraffic[]> {
    const { data, error } = await db.from("daily_traffic").select("*").limit(days);
    if (error) throw error;
    return (data ?? []).reverse();
  },

  async funnel(db: DB): Promise<ConversionFunnel> {
    const { data, error } = await db.from("conversion_funnel").select("*").single();
    if (error) throw error;
    return data;
  },
};
