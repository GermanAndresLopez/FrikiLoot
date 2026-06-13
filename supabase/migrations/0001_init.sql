-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — 0001_init                                              ║
-- ║ Tablas, índices y restricciones                                   ║
-- ╚══════════════════════════════════════════════════════════════════╝

create extension if not exists "pgcrypto";

-- ── Categorías ──────────────────────────────────────────────────────
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  slug          text not null unique,
  description   text,
  image_url     text,
  is_active     boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index categories_active_order_idx on public.categories (is_active, display_order);

-- ── Productos ───────────────────────────────────────────────────────
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  category_id uuid references public.categories (id) on delete set null,
  price       numeric(12, 0) not null check (price >= 0),   -- COP, sin decimales
  stock       integer not null default 0 check (stock >= 0),
  has_sizes   boolean not null default false,
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index products_category_idx on public.products (category_id);
create index products_active_idx   on public.products (is_active);
create index products_featured_idx on public.products (is_featured) where is_featured;
-- Búsqueda por nombre/descripción (acentos-insensible vía unaccent opcional)
create index products_name_trgm_idx on public.products using gin (to_tsvector('spanish', name || ' ' || coalesce(description, '')));

-- ── Tallas por producto ─────────────────────────────────────────────
create table public.product_sizes (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size       text not null,
  stock      integer not null default 0 check (stock >= 0),
  unique (product_id, size)
);
create index product_sizes_product_idx on public.product_sizes (product_id);

-- ── Imágenes por producto ───────────────────────────────────────────
create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  alt        text,
  position   integer not null default 0,
  is_primary boolean not null default false
);
create index product_images_product_idx on public.product_images (product_id, position);

-- ── Analítica: vistas de producto ───────────────────────────────────
create table public.product_views (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  session_id text,
  created_at timestamptz not null default now()
);
create index product_views_product_idx on public.product_views (product_id);
create index product_views_created_idx on public.product_views (created_at);

-- ── Analítica: eventos de carrito ───────────────────────────────────
create table public.cart_events (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size       text,
  quantity   integer not null default 1,
  event_type text not null default 'add' check (event_type in ('add', 'remove', 'update')),
  session_id text,
  created_at timestamptz not null default now()
);
create index cart_events_product_idx on public.cart_events (product_id);
create index cart_events_created_idx on public.cart_events (created_at);

-- ── Pedidos enviados por WhatsApp ───────────────────────────────────
create table public.whatsapp_orders (
  id             uuid primary key default gen_random_uuid(),
  items          jsonb not null,
  total          numeric(12, 0) not null,
  customer_name  text,
  customer_phone text,
  session_id     text,
  created_at     timestamptz not null default now()
);
create index whatsapp_orders_created_idx on public.whatsapp_orders (created_at);

-- ── Notificaciones del admin ────────────────────────────────────────
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  type        text not null check (type in ('agotado', 'stock_bajo', 'producto_popular', 'incremento_visitas', 'nuevo_pedido')),
  is_read     boolean not null default false,
  metadata    jsonb,
  created_at  timestamptz not null default now()
);
create index notifications_unread_idx on public.notifications (is_read, created_at desc);

-- ── Allowlist de administradores ────────────────────────────────────
-- id = auth.users.id. Estar en esta tabla = ser admin.
create table public.admins (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);
