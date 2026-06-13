-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — seed (datos de ejemplo)                               ║
-- ║ Ejecutar después de las migraciones. Idempotente por slug.        ║
-- ╚══════════════════════════════════════════════════════════════════╝

insert into public.categories (name, slug, description, is_active, display_order) values
  ('Suéteres',  'sueteres',  'Hoodies y suéteres con diseños de anime.', true, 1),
  ('Camisetas', 'camisetas', 'Camisetas oversize y regulares.',          true, 2),
  ('Figuras',   'figuras',   'Figuras coleccionables y nendoroids.',     true, 3),
  ('Pines',     'pines',     'Pines metálicos y de esmalte.',            true, 4),
  ('Llaveros',  'llaveros',  'Llaveros y accesorios pequeños.',          true, 5),
  ('Posters',   'posters',   'Posters y láminas decorativas.',           true, 6)
on conflict (slug) do nothing;

-- Producto con tallas (suéter)
with cat as (select id from public.categories where slug = 'sueteres')
insert into public.products (name, slug, description, category_id, price, stock, has_sizes, is_featured, is_active)
select 'Suéter Naruto', 'sueter-naruto',
       'Hoodie negro con estampado del clan Uzumaki. Algodón premium.',
       cat.id, 120000, 13, true, true, true   -- stock = suma de tallas (S4+M6+L3+XL0)
from cat
on conflict (slug) do nothing;

-- Tallas del suéter
with p as (select id from public.products where slug = 'sueter-naruto')
insert into public.product_sizes (product_id, size, stock)
select p.id, s.size, s.stock
from p, (values ('S', 4), ('M', 6), ('L', 3), ('XL', 0)) as s(size, stock)
on conflict (product_id, size) do nothing;

-- Productos sin tallas
with cat as (select id from public.categories where slug = 'pines')
insert into public.products (name, slug, description, category_id, price, stock, has_sizes, is_featured, is_active)
select 'Pin Akatsuki', 'pin-akatsuki', 'Pin de esmalte de la nube Akatsuki.', cat.id, 15000, 25, false, true, true
from cat on conflict (slug) do nothing;

with cat as (select id from public.categories where slug = 'figuras')
insert into public.products (name, slug, description, category_id, price, stock, has_sizes, is_featured, is_active)
select 'Figura Gojo Satoru', 'figura-gojo-satoru', 'Figura escala 1/7 de Jujutsu Kaisen.', cat.id, 280000, 3, false, true, true
from cat on conflict (slug) do nothing;

with cat as (select id from public.categories where slug = 'camisetas')
insert into public.products (name, slug, description, category_id, price, stock, has_sizes, is_featured, is_active)
select 'Camiseta One Piece', 'camiseta-one-piece', 'Camiseta oversize Jolly Roger.', cat.id, 65000, 12, true, false, true
from cat on conflict (slug) do nothing;

with p as (select id from public.products where slug = 'camiseta-one-piece')
insert into public.product_sizes (product_id, size, stock)
select p.id, s.size, s.stock
from p, (values ('S', 3), ('M', 5), ('L', 4)) as s(size, stock)
on conflict (product_id, size) do nothing;
