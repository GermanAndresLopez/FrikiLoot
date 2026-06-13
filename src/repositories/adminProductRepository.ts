import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Product, ProductImage, ProductSize } from "@/types/domain";
import type { ProductInput } from "@/validations/product";

type DB = SupabaseClient<Database>;

export interface AdminProductRow extends Product {
  category: { id: string; name: string } | null;
  primary_image: string | null;
  total_size_stock: number | null;
}

export const adminProductRepository = {
  async list(db: DB): Promise<AdminProductRow[]> {
    const { data, error } = await db
      .from("products")
      .select("*, category:categories(id, name), product_images(url, is_primary), product_sizes(stock)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const images = (row.product_images as { url: string; is_primary: boolean }[]) ?? [];
      const sizes = (row.product_sizes as { stock: number }[]) ?? [];
      return {
        ...(row as unknown as Product),
        category: (row.category as AdminProductRow["category"]) ?? null,
        primary_image: (images.find((i) => i.is_primary) ?? images[0])?.url ?? null,
        total_size_stock: sizes.length ? sizes.reduce((a, s) => a + s.stock, 0) : null,
      };
    });
  },

  async getById(
    db: DB,
    id: string
  ): Promise<(Product & { images: ProductImage[]; sizes: ProductSize[] }) | null> {
    const { data, error } = await db
      .from("products")
      .select("*, product_images(*), product_sizes(*)")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      ...(data as unknown as Product),
      images: ((data.product_images as ProductImage[]) ?? []).sort((a, b) => a.position - b.position),
      sizes: (data.product_sizes as ProductSize[]) ?? [],
    };
  },

  /** Crea producto + tallas. Devuelve el id. */
  async create(db: DB, input: ProductInput): Promise<string> {
    const { sizes, ...fields } = input;
    const stock = input.has_sizes ? sizes.reduce((a, s) => a + s.stock, 0) : input.stock;

    const { data, error } = await db
      .from("products")
      .insert({ ...fields, stock, description: fields.description || null })
      .select("id")
      .single();
    if (error) throw error;

    if (input.has_sizes && sizes.length) {
      const { error: sizeErr } = await db
        .from("product_sizes")
        .insert(sizes.map((s) => ({ product_id: data.id, size: s.size, stock: s.stock })));
      if (sizeErr) throw sizeErr;
    }
    return data.id;
  },

  /** Actualiza producto y reemplaza tallas. */
  async update(db: DB, id: string, input: ProductInput): Promise<void> {
    const { sizes, ...fields } = input;
    const stock = input.has_sizes ? sizes.reduce((a, s) => a + s.stock, 0) : input.stock;

    const { error } = await db
      .from("products")
      .update({ ...fields, stock, description: fields.description || null })
      .eq("id", id);
    if (error) throw error;

    // Reemplazo simple de tallas (borrar e insertar).
    await db.from("product_sizes").delete().eq("product_id", id);
    if (input.has_sizes && sizes.length) {
      const { error: sizeErr } = await db
        .from("product_sizes")
        .insert(sizes.map((s) => ({ product_id: id, size: s.size, stock: s.stock })));
      if (sizeErr) throw sizeErr;
    }
  },

  async remove(db: DB, id: string): Promise<void> {
    // product_images y product_sizes caen por ON DELETE CASCADE.
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) throw error;
  },

  async addImage(db: DB, productId: string, url: string, position: number, isPrimary: boolean) {
    const { error } = await db
      .from("product_images")
      .insert({ product_id: productId, url, position, is_primary: isPrimary });
    if (error) throw error;
  },

  async removeImage(db: DB, imageId: string): Promise<void> {
    const { error } = await db.from("product_images").delete().eq("id", imageId);
    if (error) throw error;
  },

  /** Ajusta stock de un producto sin tallas (delta puede ser negativo). */
  async adjustStock(db: DB, productId: string, delta: number): Promise<number> {
    const { data: prod, error: readErr } = await db
      .from("products")
      .select("stock")
      .eq("id", productId)
      .single();
    if (readErr) throw readErr;
    const next = Math.max(0, prod.stock + delta);
    const { error } = await db.from("products").update({ stock: next }).eq("id", productId);
    if (error) throw error;
    return next;
  },

  /** Ajusta stock de una talla y re-sincroniza el stock total del producto. */
  async adjustSizeStock(db: DB, productId: string, size: string, delta: number): Promise<void> {
    const { data: row, error: readErr } = await db
      .from("product_sizes")
      .select("id, stock")
      .eq("product_id", productId)
      .eq("size", size)
      .single();
    if (readErr) throw readErr;
    const next = Math.max(0, row.stock + delta);
    await db.from("product_sizes").update({ stock: next }).eq("id", row.id);

    // Re-sincroniza products.stock = suma de tallas (dispara notificaciones).
    const { data: all } = await db.from("product_sizes").select("stock").eq("product_id", productId);
    const total = (all ?? []).reduce((a, s) => a + s.stock, 0);
    await db.from("products").update({ stock: total }).eq("id", productId);
  },
};
