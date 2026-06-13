/**
 * Tipos del esquema de base de datos.
 * Espejo manual de las migraciones en `supabase/migrations`.
 * Puede regenerarse con:
 *   supabase gen types typescript --project-id <id> > src/types/database.ts
 *
 * Convención: en Insert, los campos con DEFAULT o NULLABLE son opcionales.
 * `Relationships: []` es obligatorio para que cada tabla/vista satisfaga el
 * contrato `GenericTable`/`GenericView` de @supabase/supabase-js (sin él, el
 * cliente tipado degrada insert/update/select a `never`).
 */

export type NotificationType =
  | "agotado"
  | "stock_bajo"
  | "producto_popular"
  | "incremento_visitas"
  | "nuevo_pedido";

export type CartEventType = "add" | "remove" | "update";

export interface OrderItemSnapshot {
  product_id: string;
  name: string;
  size: string | null;
  quantity: number;
  unit_price: number;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          display_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category_id: string | null;
          price: number;
          stock: number;
          has_sizes: boolean;
          is_featured: boolean;
          is_active: boolean;
          popularity_score: number;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          category_id?: string | null;
          price: number;
          stock?: number;
          has_sizes?: boolean;
          is_featured?: boolean;
          is_active?: boolean;
          popularity_score?: number;
          low_stock_threshold?: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_sizes: {
        Row: { id: string; product_id: string; size: string; stock: number };
        Insert: { id?: string; product_id: string; size: string; stock?: number };
        Update: Partial<Database["public"]["Tables"]["product_sizes"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt: string | null;
          position: number;
          is_primary: boolean;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt?: string | null;
          position?: number;
          is_primary?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [];
      };
      product_views: {
        Row: { id: string; product_id: string; session_id: string | null; created_at: string };
        Insert: { id?: string; product_id: string; session_id?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["product_views"]["Insert"]>;
        Relationships: [];
      };
      cart_events: {
        Row: {
          id: string;
          product_id: string;
          size: string | null;
          quantity: number;
          event_type: CartEventType;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size?: string | null;
          quantity?: number;
          event_type?: CartEventType;
          session_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["cart_events"]["Insert"]>;
        Relationships: [];
      };
      whatsapp_orders: {
        Row: {
          id: string;
          items: OrderItemSnapshot[];
          total: number;
          customer_name: string | null;
          customer_phone: string | null;
          session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          items: OrderItemSnapshot[];
          total: number;
          customer_name?: string | null;
          customer_phone?: string | null;
          session_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["whatsapp_orders"]["Insert"]>;
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: NotificationType;
          is_read: boolean;
          metadata: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: NotificationType;
          is_read?: boolean;
          metadata?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: [];
      };
      admins: {
        Row: { id: string; email: string; created_at: string };
        Insert: { id: string; email: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["admins"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: {
      product_metrics: {
        Row: {
          product_id: string;
          name: string;
          slug: string;
          views: number;
          cart_adds: number;
          whatsapp_sends: number;
        };
        Relationships: [];
      };
      daily_traffic: {
        Row: { day: string; views: number; unique_sessions: number };
        Relationships: [];
      };
      conversion_funnel: {
        Row: { visits: number; product_views: number; cart_adds: number; whatsapp_sends: number };
        Relationships: [];
      };
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      bump_popularity: { Args: { p_id: string; p_amount: number }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
