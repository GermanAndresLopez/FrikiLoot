-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — 0008_app_settings                                     ║
-- ║ Ajustes globales del sitio (tema de colores). Fila única.         ║
-- ║ Ejecutar después de 0001–0007.                                    ║
-- ╚══════════════════════════════════════════════════════════════════╝

create table if not exists public.app_settings (
  id         integer primary key default 1 check (id = 1),
  theme      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Garantiza la fila única.
insert into public.app_settings (id, theme) values (1, '{}'::jsonb)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;

-- Lectura pública: el tema debe aplicarse a todos los visitantes.
create policy "settings_public_read" on public.app_settings
  for select using (true);

-- Escritura: solo administradores.
create policy "settings_admin_write" on public.app_settings
  for all using (public.is_admin()) with check (public.is_admin());
