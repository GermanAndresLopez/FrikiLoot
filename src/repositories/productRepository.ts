import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  CatalogFilters,
  Product,
  ProductCard,
  ProductDetail,
} from "@/types/domain";
import { PAGE_SIZE } from "@/lib/constants";

type DB = SupabaseClient<Database>;

const CARD_SELECT =
  "*, category:categories(id, name, slug), product_images(url, is_primary, position), product_sizes(stock)";

/** Calcula stock efectivo y extrae imagen principal de un row con relaciones. */
function toCard(row: Record<string, unknown>): ProductCard {
  const images = (row.product_images as { url: string; is_primary: boolean; position: number }[]) ?? [];
  const sizes = (row.product_sizes as { stock: number }[]) ?? [];
  const primary = images.find((i) => i.is_primary) ?? images.sort((a, b) => a.position - b.position)[0];
  const product = row as unknown as Product;
  const effective = product.has_sizes
    ? sizes.reduce((acc, s) => acc + s.stock, 0)
    : product.stock;

  return {
    ...product,
    category: (row.category as ProductCard["category"]) ?? null,
    primary_image: primary?.url ?? null,
    effective_stock: effective,
  };
}

export const productRepository = {
  /** Catálogo paginado con filtros, búsqueda y orden. Devuelve total para paginar. */
  async listCatalog(db: DB, filters: CatalogFilters): Promise<{ items: ProductCard[]; total: number }> {
    const page = Math.max(1, filters.page ?? 1);
    const from = (page - 1) * PAGE_SIZE;

    let query = db
      .from("products")
      .select(CARD_SELECT, { count: "exact" })
      .eq("is_active", true);

    if (filters.q) {
      query = query.or(`name.ilike.%${filters.q}%,description.ilike.%${filters.q}%`);
    }
    if (filters.category) {
      const { data: cat } = await db
        .from("categories")
        .select("id")
        .eq("slug", filters.category)
        .maybeSingle();
      if (cat) query = query.eq("category_id", cat.id);
    }
    if (filters.availability === "in_stock") {
      query = query.gt("stock", 0);
    }

    switch (filters.sort) {
      case "precio_asc":
        query = query.order("price", { ascending: true });
        break;
      case "precio_desc":
        query = query.order("price", { ascending: false });
        break;
      case "populares":
        // Aproximación pública: destacados primero, luego recientes.
        // (product_metrics solo es legible por admin vía RLS.)
        query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    query = query.range(from, from + PAGE_SIZE - 1);

    const { data, error, count } = await query;
    if (error) throw error;
    return { items: (data ?? []).map(toCard), total: count ?? 0 };
  },

  async listFeatured(db: DB, limit = 8): Promise<ProductCard[]> {
    const { data, error } = await db
      .from("products")
      .select(CARD_SELECT)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toCard);
  },

  async getDetailBySlug(db: DB, slug: string): Promise<ProductDetail | null> {
    const { data, error } = await db
      .from("products")
      .select("*, category:categories(*), product_images(*), product_sizes(*)")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const images = ((data.product_images as ProductDetail["images"]) ?? []).sort(
      (a, b) => a.position - b.position
    );
    const sizes = ((data.product_sizes as ProductDetail["sizes"]) ?? []).slice();
    const effective = data.has_sizes
      ? sizes.reduce((acc, s) => acc + s.stock, 0)
      : data.stock;

    return {
      ...(data as unknown as Product),
      category: (data.category as ProductDetail["category"]) ?? null,
      images,
      sizes,
      effective_stock: effective,
    };
  },

  async listRelated(db: DB, categoryId: string | null, excludeId: string, limit = 4): Promise<ProductCard[]> {
    if (!categoryId) return [];
    const { data, error } = await db
      .from("products")
      .select(CARD_SELECT)
      .eq("is_active", true)
      .eq("category_id", categoryId)
      .neq("id", excludeId)
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toCard);
  },

  /** Todos los slugs activos — para sitemap y generación estática. */
  async listActiveSlugs(db: DB): Promise<{ slug: string; updated_at: string }[]> {
    const { data, error } = await db
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);
    if (error) throw error;
    return data ?? [];
  },
};
