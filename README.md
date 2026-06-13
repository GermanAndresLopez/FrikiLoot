# FrikiLoot 🛍️

Tienda de productos de anime tipo catálogo, **Mobile First**, con pedidos por **WhatsApp** (sin pagos online) y un **panel administrativo** completo (productos, categorías, inventario, métricas y notificaciones).

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **TailwindCSS v4** · **Framer Motion**
- **Supabase**: PostgreSQL · Auth · Storage
- **Zod** (validación) · **Zustand** (carrito, persistido en `localStorage`)
- Despliegue: **Vercel** (app) + **Supabase** (datos)

## Puesta en marcha

> El proyecto genera los archivos pero **no instala dependencias automáticamente**. Ejecuta los pasos manualmente.

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno** — copia `.env.example` a `.env.local` y rellena:
   ```bash
   cp .env.example .env.local
   ```
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Supabase → Project Settings → API)
   - `NEXT_PUBLIC_WHATSAPP_NUMBER` (formato internacional sin `+`, ej. `573001234567`)
   - `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GA_ID` (opcional)

3. **Aplicar el esquema en Supabase** — en el SQL Editor del proyecto, ejecuta en orden los archivos de [`supabase/migrations/`](supabase/migrations/):
   `0001_init` → `0002_rls` → `0003_triggers` → `0004_views` → `0005_storage`.
   Luego (opcional) [`supabase/seed.sql`](supabase/seed.sql) para datos de ejemplo.

4. **Crear el usuario administrador**
   - Supabase → **Authentication → Users → Add user** (email + contraseña).
   - Copia su `id` (UUID) y autorízalo en la allowlist:
     ```sql
     insert into public.admins (id, email)
     values ('UUID-DEL-USUARIO', 'admin@frikiloot.com');
     ```

5. **Ejecutar**
   ```bash
   npm run dev      # http://localhost:3000  (tienda)
   ```
   El panel admin está en `/admin` (login en `/admin/login`).

## Scripts

| Script | Acción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir el build |
| `npm run lint` | ESLint (Next) |
| `npm run typecheck` | `tsc --noEmit` |

## Documentación

- [`FRONTEND.md`](FRONTEND.md) — estructura del front, rutas, componentes, estado y SEO.
- [`BACKEND.md`](BACKEND.md) — modelo de datos, RLS, triggers, vistas y capa de servidor.

## Despliegue (resumen)

1. Crea el proyecto en **Supabase** y aplica migraciones + crea admin.
2. Importa el repo en **Vercel**, define las mismas variables de entorno (`NEXT_PUBLIC_SITE_URL` = dominio de producción).
3. Vercel construye con `npm run build`. Las imágenes de producto se sirven desde Supabase Storage (dominio ya permitido en `next.config.ts`).

## Arquitectura (alto nivel)

```
Cliente ─▶ Next.js (Server Components / Server Actions)
            │
            ├─ actions/      mutaciones + logging (capa de aplicación)
            ├─ services/     lógica de negocio (WhatsApp, métricas, auth)
            ├─ repositories/ acceso a datos (Supabase)
            └─ Supabase: PostgreSQL · Auth · Storage
```

Principios: Clean Architecture, Repository Pattern, Server Components por defecto y Client Components solo donde hay interactividad (carrito, filtros, formularios).
