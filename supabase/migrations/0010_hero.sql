-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — 0010_hero                                             ║
-- ║ Configuración editable de la portada (hero) del inicio.           ║
-- ║ Ejecutar después de 0001–0009.                                    ║
-- ╚══════════════════════════════════════════════════════════════════╝

alter table public.app_settings
  add column if not exists hero jsonb not null default '{}'::jsonb;
