-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — 0003_triggers                                         ║
-- ║ updated_at automático + notificaciones de stock                   ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ── updated_at automático ───────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ── Notificaciones automáticas por nivel de stock ───────────────────
-- Umbral de stock bajo (ajustable). Debe coincidir con NEXT_PUBLIC_LOW_STOCK_THRESHOLD.
create or replace function public.notify_stock_change()
returns trigger
language plpgsql
as $$
declare
  low_threshold integer := 5;
begin
  -- Solo reaccionar cuando el stock realmente baja
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
  elsif new.stock > 0 and new.stock <= low_threshold and old.stock > low_threshold then
    insert into public.notifications (title, description, type, metadata)
    values (
      'Stock bajo',
      new.name || ' tiene solo ' || new.stock || ' unidades.',
      'stock_bajo',
      jsonb_build_object('product_id', new.id, 'slug', new.slug, 'stock', new.stock)
    );
  end if;

  return new;
end;
$$;

create trigger products_notify_stock
  after update of stock on public.products
  for each row execute function public.notify_stock_change();

-- ── Notificación al registrar un pedido por WhatsApp ────────────────
create or replace function public.notify_new_order()
returns trigger
language plpgsql
as $$
begin
  insert into public.notifications (title, description, type, metadata)
  values (
    'Nuevo pedido por WhatsApp',
    'Pedido por $' || to_char(new.total, 'FM999G999G999') ||
      coalesce(' de ' || new.customer_name, '') || '.',
    'nuevo_pedido',
    jsonb_build_object('order_id', new.id, 'total', new.total)
  );
  return new;
end;
$$;

create trigger orders_notify_new
  after insert on public.whatsapp_orders
  for each row execute function public.notify_new_order();
