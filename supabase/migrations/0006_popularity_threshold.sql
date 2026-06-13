-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — 0006_popularity_threshold                             ║
-- ║ Popularidad (auto-orden de destacados) + umbral de stock por      ║
-- ║ producto. Ejecutar después de 0001–0005.                          ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ── Nuevas columnas en products ─────────────────────────────────────
alter table public.products
  add column if not exists popularity_score integer not null default 0;

alter table public.products
  add column if not exists low_stock_threshold integer not null default 5;

-- Orden de destacados por popularidad
create index if not exists products_featured_popular_idx
  on public.products (is_featured, popularity_score desc);

-- ── Incremento atómico de popularidad ───────────────────────────────
-- Se llama desde el servidor (service role) al registrar vistas, adds y pedidos.
create or replace function public.bump_popularity(p_id uuid, p_amount integer)
returns void
language sql
security definer
set search_path = public
as $$
  update public.products
  set popularity_score = greatest(0, popularity_score + p_amount)
  where id = p_id;
$$;

grant execute on function public.bump_popularity(uuid, integer) to anon, authenticated, service_role;

-- ── Trigger de stock: umbral por producto ───────────────────────────
create or replace function public.notify_stock_change()
returns trigger
language plpgsql
as $$
begin
  if new.stock = old.stock then
    return new;
  end if;

  if new.stock = 0 and old.stock > 0 then
    insert into public.notifications (title, description, type, metadata)
    values (
      'Producto agotado',
      new.name || ' se quedó sin stock.',
      'agotado',
      jsonb_build_object('product_id', new.id, 'slug', new.slug)
    );
  elsif new.stock > 0
        and new.stock <= new.low_stock_threshold
        and old.stock > new.low_stock_threshold then
    insert into public.notifications (title, description, type, metadata)
    values (
      'Stock bajo',
      new.name || ' tiene solo ' || new.stock || ' unidades (umbral ' || new.low_stock_threshold || ').',
      'stock_bajo',
      jsonb_build_object('product_id', new.id, 'slug', new.slug, 'stock', new.stock)
    );
  end if;

  return new;
end;
$$;
