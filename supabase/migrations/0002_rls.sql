-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — 0002_rls                                              ║
-- ║ Row Level Security + helper is_admin()                            ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Helper: ¿el usuario autenticado está en la allowlist de admins?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.id = auth.uid());
$$;

-- Habilitar RLS en todas las tablas
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_sizes   enable row level security;
alter table public.product_images  enable row level security;
alter table public.product_views   enable row level security;
alter table public.cart_events     enable row level security;
alter table public.whatsapp_orders enable row level security;
alter table public.notifications   enable row level security;
alter table public.admins          enable row level security;

-- ── Lectura pública de catálogo (solo filas activas) ────────────────
create policy "cat_public_read" on public.categories
  for select using (is_active or public.is_admin());

create policy "prod_public_read" on public.products
  for select using (is_active or public.is_admin());

create policy "sizes_public_read" on public.product_sizes
  for select using (
    public.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.is_active)
  );

create policy "images_public_read" on public.product_images
  for select using (
    public.is_admin()
    or exists (select 1 from public.products p where p.id = product_id and p.is_active)
  );

-- ── Escritura de catálogo: solo admins ──────────────────────────────
create policy "cat_admin_write"    on public.categories     for all using (public.is_admin()) with check (public.is_admin());
create policy "prod_admin_write"   on public.products       for all using (public.is_admin()) with check (public.is_admin());
create policy "sizes_admin_write"  on public.product_sizes  for all using (public.is_admin()) with check (public.is_admin());
create policy "images_admin_write" on public.product_images for all using (public.is_admin()) with check (public.is_admin());

-- ── Analítica: lectura solo admin. Escritura vía service role ───────
-- (Las Server Actions usan service role y omiten RLS; anon no escribe.)
create policy "views_admin_read"  on public.product_views   for select using (public.is_admin());
create policy "cart_admin_read"   on public.cart_events     for select using (public.is_admin());
create policy "orders_admin_read" on public.whatsapp_orders for select using (public.is_admin());

-- ── Notificaciones: solo admin ──────────────────────────────────────
create policy "notif_admin_all" on public.notifications for all using (public.is_admin()) with check (public.is_admin());

-- ── Admins: cada usuario puede leer su propia fila ──────────────────
create policy "admins_self_read" on public.admins for select using (id = auth.uid());
