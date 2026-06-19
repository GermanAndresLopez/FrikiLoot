import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { News } from "@/types/domain";

type DB = SupabaseClient<Database>;

export interface NewsInsert {
  title: string | null;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  ends_at: string | null;
}

export const newsRepository = {
  /** Publicaciones visibles para el público (RLS ya filtra activas/no vencidas). */
  async listPublic(db: DB): Promise<News[]> {
    const { data, error } = await db
      .from("news")
      .select("*")
      .eq("is_active", true)
      .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async listAll(db: DB): Promise<News[]> {
    const { data, error } = await db
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },

  async create(db: DB, input: NewsInsert): Promise<void> {
    const { error } = await db.from("news").insert(input);
    if (error) throw error;
  },

  async update(db: DB, id: string, input: NewsInsert): Promise<void> {
    const { error } = await db.from("news").update(input).eq("id", id);
    if (error) throw error;
  },

  async remove(db: DB, id: string): Promise<void> {
    const { error } = await db.from("news").delete().eq("id", id);
    if (error) throw error;
  },
};
