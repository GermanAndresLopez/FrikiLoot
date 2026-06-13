import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Category } from "@/types/domain";
import type { CategoryInput } from "@/validations/category";

type DB = SupabaseClient<Database>;

/** Acceso a datos de categorías. Recibe el cliente Supabase por inyección. */
export const categoryRepository = {
  async listActive(db: DB): Promise<Category[]> {
    const { data, error } = await db
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async listAll(db: DB): Promise<Category[]> {
    const { data, error } = await db
      .from("categories")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return data ?? [];
  },

  async getBySlug(db: DB, slug: string): Promise<Category | null> {
    const { data, error } = await db.from("categories").select("*").eq("slug", slug).maybeSingle();
    if (error) throw error;
    return data;
  },

  async create(db: DB, input: CategoryInput): Promise<Category> {
    const { data, error } = await db.from("categories").insert(input).select("*").single();
    if (error) throw error;
    return data;
  },

  async update(db: DB, id: string, input: Partial<CategoryInput>): Promise<Category> {
    const { data, error } = await db
      .from("categories")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return data;
  },

  async remove(db: DB, id: string): Promise<void> {
    const { error } = await db.from("categories").delete().eq("id", id);
    if (error) throw error;
  },
};
