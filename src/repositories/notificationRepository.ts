import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Notification } from "@/types/domain";

type DB = SupabaseClient<Database>;

export const notificationRepository = {
  async list(db: DB, limit = 50): Promise<Notification[]> {
    const { data, error } = await db
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  },

  async unreadCount(db: DB): Promise<number> {
    const { count, error } = await db
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("is_read", false);
    if (error) throw error;
    return count ?? 0;
  },

  async markRead(db: DB, id: string): Promise<void> {
    const { error } = await db.from("notifications").update({ is_read: true }).eq("id", id);
    if (error) throw error;
  },

  async markAllRead(db: DB): Promise<void> {
    const { error } = await db.from("notifications").update({ is_read: true }).eq("is_read", false);
    if (error) throw error;
  },
};
