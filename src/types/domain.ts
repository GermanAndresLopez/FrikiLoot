import type { Database } from "./database";

export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductSize = Database["public"]["Tables"]["product_sizes"]["Row"];
export type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type WhatsappOrder = Database["public"]["Tables"]["whatsapp_orders"]["Row"];
export type News = Database["public"]["Tables"]["news"]["Row"];

export type ProductMetric = Database["public"]["Views"]["product_metrics"]["Row"];
export type DailyTraffic = Database["public"]["Views"]["daily_traffic"]["Row"];
export type ConversionFunnel = Database["public"]["Views"]["conversion_funnel"]["Row"];

/** Producto con relaciones para listados (incluye imagen principal y categoría). */
export interface ProductCard extends Product {
  category: Pick<Category, "id" | "name" | "slug"> | null;
  primary_image: string | null;
  /** Stock efectivo: suma de tallas si has_sizes, si no el stock plano. */
  effective_stock: number;
}

/** Producto completo para la página de detalle. */
export interface ProductDetail extends Product {
  category: Category | null;
  images: ProductImage[];
  sizes: ProductSize[];
  effective_stock: number;
}

export interface CatalogFilters {
  q?: string;
  category?: string; // slug
  availability?: "all" | "in_stock";
  sort?: "recientes" | "precio_asc" | "precio_desc" | "populares";
  page?: number;
}
