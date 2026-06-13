# Frontend — FrikiLoot

Aplicación **Mobile First** con modo oscuro por defecto y estética anime (acentos magenta/cian). Server Components por defecto; Client Components solo donde hay interactividad.

## Estructura

```
src/
├─ app/
│  ├─ layout.tsx            # layout raíz: fuente, metadata global, GA4
│  ├─ globals.css           # tema Tailwind v4 (@theme) + utilidades
│  ├─ robots.ts · sitemap.ts
│  ├─ (shop)/               # TIENDA (cliente)
│  │  ├─ layout.tsx         # ShopHeader + BottomNav
│  │  ├─ page.tsx           # Home: hero, categorías, destacados (ISR 120s)
│  │  ├─ productos/         # Catálogo con filtros/orden/paginación
│  │  ├─ producto/[slug]/   # Detalle: galería, tallas, relacionados, JSON-LD
│  │  └─ carrito/           # Carrito + checkout WhatsApp
│  └─ admin/                # PANEL ADMIN
│     ├─ layout.tsx         # passthrough (noindex)
│     ├─ login/             # login (fuera del guard)
│     └─ (dashboard)/       # grupo PROTEGIDO (guard de sesión admin)
│        ├─ page.tsx        # dashboard de métricas
│        ├─ productos/      # lista, nuevo, [id] (editar + imágenes)
│        ├─ categorias/ · inventario/ · notificaciones/
├─ components/              # UI reutilizable
│  ├─ ui/                   # Button, Badge, Input/Field, Spinner
│  ├─ ShopHeader · BottomNav · Analytics
├─ features/               # módulos por dominio
│  ├─ catalog/             # ProductCard, CatalogFilters, Gallery, AddToCartPanel, ViewTracker
│  ├─ cart/                # CartView
│  └─ admin/               # LoginForm, AdminNav, ProductForm, CategoryManager, StockControl, tarjetas…
├─ store/cartStore.ts      # Zustand + persist (localStorage)
├─ hooks/ · lib/
```

## Rutas

| Ruta | Tipo | Descripción |
| --- | --- | --- |
| `/` | ISR | Home: destacados + categorías |
| `/productos` | dynamic | Catálogo: `?q`, `?category`, `?availability`, `?sort`, `?page` |
| `/producto/[slug]` | ISR | Detalle de producto |
| `/carrito` | client | Carrito y checkout (noindex) |
| `/admin/login` | — | Acceso admin |
| `/admin`, `/admin/productos`, `/admin/categorias`, `/admin/inventario`, `/admin/notificaciones` | dynamic | Panel (protegido) |

## Estado del carrito

- `store/cartStore.ts`: Zustand con `persist` en `localStorage` (clave `frikiloot-cart`). **No requiere login.**
- Clave por `producto + talla`; valida contra `maxStock`. Selectores `useCartCount` / `useCartTotal`.
- En `CartView` se difiere el render hasta `mounted` para evitar mismatch de hidratación.

## Diseño / tema

- Definido en `globals.css` con `@theme` (Tailwind v4): colores `bg`, `surface`, `primary`, `accent`, etc. → utilidades `bg-bg`, `text-primary`, `rounded-card`…
- Utilidades propias: `bg-brand-gradient`, `text-brand-gradient`, `no-scrollbar`.
- **Mobile First**: `BottomNav` fija con badge del carrito; targets táctiles ≥ 44px; `safe-area-inset` respetada.
- Animaciones sutiles con Framer Motion (indicador activo de la BottomNav).

## Navegación inferior / a una mano

`BottomNav` (móvil) con Inicio · Catálogo · Carrito. En el admin, `AdminNav` ofrece sidebar en desktop y barra inferior en móvil.

## Formularios y acciones

- Formularios usan **Server Actions** con `useActionState` (React 19) y `useFormStatus` para estados de envío.
- Validación con Zod compartida cliente/servidor (`src/validations`). Errores por campo se muestran junto al input (`Field`).
- Subida de imágenes: `ProductImageManager` envía el archivo a una Server Action que sube a Supabase Storage.

## Analítica de cliente

- `getSessionId()` (`lib/session.ts`) genera un id anónimo persistente.
- `ViewTracker` registra la vista del producto una vez al montar; `AddToCartPanel` y `CartView` registran eventos de carrito vía Server Actions (`actions/metrics.ts`).
- GA4 opcional vía `components/Analytics.tsx` (solo si `NEXT_PUBLIC_GA_ID`).

## SEO

- Metadata global en `app/layout.tsx` (`metadataBase`, Open Graph, plantilla de título).
- Metadata dinámica por producto en `producto/[slug]` (`generateMetadata` + canonical + OG image).
- **JSON-LD** `Product` con precio (COP), disponibilidad e imágenes en la página de detalle.
- `sitemap.ts` (home + catálogo + categorías + productos activos) y `robots.ts` (excluye `/admin` y `/carrito`).

## Checkout WhatsApp (flujo)

1. El usuario completa nombre y teléfono en `CartView`.
2. `checkoutAction` valida (Zod), registra el pedido y devuelve la URL `wa.me`.
3. Se vacía el carrito y se redirige a WhatsApp con el mensaje y total en COP ya formateados.
