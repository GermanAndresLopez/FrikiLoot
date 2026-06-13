# Backend — FrikiLoot

Capa de datos y servidor: PostgreSQL (Supabase), políticas de seguridad y la capa de aplicación en Next.js (Server Actions + servicios + repositorios).

## Estructura

```
supabase/
├─ migrations/
│  ├─ 0001_init.sql      # tablas, índices, constraints
│  ├─ 0002_rls.sql       # RLS + función is_admin()
│  ├─ 0003_triggers.sql  # updated_at + notificaciones de stock/pedido
│  ├─ 0004_views.sql     # vistas de métricas
│  └─ 0005_storage.sql   # bucket de imágenes + políticas
└─ seed.sql              # datos de ejemplo

src/
├─ actions/        # Server Actions ("use server"): auth, categories, products, inventory, orders, notifications, metrics
├─ services/       # lógica de negocio: authService, metricsService, whatsapp
├─ repositories/   # acceso a datos por entidad
├─ validations/    # esquemas Zod (category, product, order)
├─ lib/supabase/   # clientes: client (browser), server (SSR), admin (service role), middleware
└─ types/          # database.ts (espejo del esquema) + domain.ts
```

## Modelo de datos

| Tabla | Descripción |
| --- | --- |
| `categories` | Categorías dinámicas (nombre, slug, imagen, activo, orden). |
| `products` | Productos. `price numeric(12,0)` (COP, sin decimales), `slug` único, `has_sizes`, `is_featured`, `is_active`. |
| `product_sizes` | Stock por talla (cuando `has_sizes`). `unique(product_id, size)`. |
| `product_images` | Imágenes múltiples con `position` e `is_primary`. |
| `product_views` | Analítica: una fila por vista (con `session_id`). |
| `cart_events` | Analítica: add/remove/update del carrito. |
| `whatsapp_orders` | Pedidos enviados (snapshot `items jsonb`, `total`, datos del cliente). |
| `notifications` | Centro de notificaciones del admin (tipo, leído/no leído). |
| `admins` | Allowlist: `id = auth.users.id`. Estar aquí = ser admin. |

**Stock efectivo:** para productos con tallas, el stock real es la suma de `product_sizes.stock`. La columna `products.stock` se mantiene sincronizada como esa suma (ver `adjustSizeStock` y `saveProductAction`), de modo que los triggers de notificación también aplican a productos con tallas.

## Seguridad (RLS)

- `is_admin()` (SECURITY DEFINER) comprueba si `auth.uid()` está en `admins`.
- **Catálogo** (`categories`, `products`, `product_sizes`, `product_images`): lectura pública **solo de filas activas**; escritura solo admin.
- **Analítica** (`product_views`, `cart_events`, `whatsapp_orders`): lectura solo admin; **sin escritura anónima**. Las inserciones se hacen desde el servidor con el **service role** (`lib/supabase/admin.ts`) en `metricsService`, nunca desde el navegador.
- **Notificaciones**: solo admin.
- **Storage** (`product-images`): lectura pública; subida/borrado solo admin.

## Triggers

- `set_updated_at` — actualiza `updated_at` en `categories` y `products`.
- `notify_stock_change` — al bajar `products.stock`: crea notificación `agotado` (=0) o `stock_bajo` (≤ umbral, por defecto 5; ajústalo en la migración si cambias `NEXT_PUBLIC_LOW_STOCK_THRESHOLD`).
- `notify_new_order` — al insertar en `whatsapp_orders`: crea notificación `nuevo_pedido`.

## Vistas de métricas

- `product_metrics` — vistas, agregados al carrito y envíos por WhatsApp por producto.
- `daily_traffic` — vistas y sesiones únicas por día (90 días).
- `conversion_funnel` — totales del embudo Visita → Vista → Carrito → WhatsApp.

Todas usan `security_invoker = on`: respetan el RLS del consultor (solo admin las lee). Por eso, en el catálogo público, el orden "Más populares" usa una aproximación (destacados + recientes) en lugar de la vista.

## Capa de aplicación

- **Repositorios** reciben el cliente Supabase por inyección (`db: SupabaseClient<Database>`), así la misma función sirve con cliente de usuario (RLS) o admin (service role).
- **Server Actions** validan con Zod, llaman a `requireAdmin()` cuando son administrativas, ejecutan el repositorio y hacen `revalidatePath`.
- **`requireAdmin()`** (`services/authService.ts`) exige sesión + pertenencia a `admins`; úsalo al inicio de toda acción admin.
- **Checkout** (`actions/orders.ts`): valida el pedido, lo registra en `whatsapp_orders` (dispara la notificación) y devuelve la URL `wa.me` construida en `services/whatsapp.ts`.

## Crear un administrador

```sql
-- 1) Crea el usuario en Authentication → Users (email + password).
-- 2) Autorízalo:
insert into public.admins (id, email)
values ('UUID-DEL-USUARIO', 'admin@frikiloot.com');
```

## Notas / límites conocidos (MVP)

- El stock se descuenta **al confirmar manualmente** desde el admin; el checkout por WhatsApp no descuenta stock automáticamente (no hay pago/confirmación online).
- "Más populares" en el catálogo público es una aproximación (ver arriba). Para exactitud futura: contador denormalizado o vista materializada con acceso público.
- Rate limiting recomendado a nivel de Vercel/Supabase Edge para las acciones de analítica.
