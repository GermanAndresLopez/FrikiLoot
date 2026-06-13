-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — 0004_views                                            ║
-- ║ Vistas de métricas para el dashboard                              ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- security_invoker: la vista respeta el RLS del que consulta (admin).
-- ── Métricas por producto: vistas, agregados al carrito, envíos WA ──
create or replace view public.product_metrics
with (security_invoker = on) as
select
  p.id   as product_id,
  p.name,
  p.slug,
  coalesce(v.views, 0)::bigint        as views,
  coalesce(c.cart_adds, 0)::bigint    as cart_adds,
  coalesce(w.whatsapp_sends, 0)::bigint as whatsapp_sends
from public.products p
left join (
  select product_id, count(*) as views
  from public.product_views group by product_id
) v on v.product_id = p.id
left join (
  select product_id, count(*) as cart_adds
  from public.cart_events where event_type = 'add' group by product_id
) c on c.product_id = p.id
left join (
  select (item->>'product_id')::uuid as product_id, count(*) as whatsapp_sends
  from public.whatsapp_orders, jsonb_array_elements(items) as item
  group by 1
) w on w.product_id = p.id;

-- ── Tráfico diario (últimos 90 días) ────────────────────────────────
create or replace view public.daily_traffic
with (security_invoker = on) as
select
  date_trunc('day', created_at)::date          as day,
  count(*)::bigint                              as views,
  count(distinct session_id)::bigint           as unique_sessions
from public.product_views
where created_at >= now() - interval '90 days'
group by 1
order by 1 desc;

-- ── Embudo de conversión (totales) ──────────────────────────────────
create or replace view public.conversion_funnel
with (security_invoker = on) as
select
  (select count(distinct session_id) from public.product_views)                     as visits,
  (select count(*) from public.product_views)                                       as product_views,
  (select count(*) from public.cart_events where event_type = 'add')                as cart_adds,
  (select count(*) from public.whatsapp_orders)                                     as whatsapp_sends;
