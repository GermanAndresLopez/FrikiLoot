-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — 0009_news                                             ║
-- ║ Noticias / eventos publicados por el admin. Ejecutar tras 0001–08.║
-- ╚══════════════════════════════════════════════════════════════════╝

create table if not exists public.news (
  id          uuid primary key default gen_random_uuid(),
  title       text,
  description text,
  image_url   text,
  is_active   boolean not null default true,
  ends_at     timestamptz,            -- null = sin fecha de finalización (indefinida)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists news_active_idx on public.news (is_active, created_at desc);

alter table public.news enable row level security;

-- Lectura pública: solo activas y no vencidas (el admin ve todas).
create policy "news_public_read" on public.news
  for select using (
    (is_active and (ends_at is null or ends_at >= now())) or public.is_admin()
  );

-- Escritura: solo admins.
create policy "news_admin_write" on public.news
  for all using (public.is_admin()) with check (public.is_admin());

create trigger news_set_updated_at
  before update on public.news
  for each row execute function public.set_updated_at();

-- ── Bucket de imágenes de noticias ──────────────────────────────────
insert into storage.buckets (id, name, public)
values ('news-images', 'news-images', true)
on conflict (id) do nothing;

create policy "news_images_public_read"
  on storage.objects for select using (bucket_id = 'news-images');

create policy "news_images_admin_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'news-images' and public.is_admin());

create policy "news_images_admin_update"
  on storage.objects for update to authenticated
  using (bucket_id = 'news-images' and public.is_admin());

create policy "news_images_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'news-images' and public.is_admin());
