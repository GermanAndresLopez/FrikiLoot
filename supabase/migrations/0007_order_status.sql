-- ╔══════════════════════════════════════════════════════════════════╗
-- ║ FrikiLoot — 0007_order_status                                     ║
-- ║ Estado de pedidos WhatsApp para confirmar la compra y descontar   ║
-- ║ stock. Ejecutar después de 0001–0006.                             ║
-- ╚══════════════════════════════════════════════════════════════════╝

alter table public.whatsapp_orders
  add column if not exists status text not null default 'pending'
    check (status in ('pending', 'completed', 'cancelled'));

-- Evita descontar stock dos veces para el mismo pedido.
alter table public.whatsapp_orders
  add column if not exists stock_applied boolean not null default false;

create index if not exists whatsapp_orders_status_idx
  on public.whatsapp_orders (status, created_at desc);
