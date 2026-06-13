/**
 * Acceso centralizado y tipado a variables de entorno.
 * Las `NEXT_PUBLIC_*` están disponibles en cliente y servidor.
 * `SUPABASE_SERVICE_ROLE_KEY` solo debe leerse en código de servidor.
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  // Acepta el nombre nuevo de Supabase (publishable) y el antiguo (anon).
  supabaseAnonKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  storeName: process.env.NEXT_PUBLIC_STORE_NAME ?? "FrikiLoot",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  lowStockThreshold: Number(process.env.NEXT_PUBLIC_LOW_STOCK_THRESHOLD ?? "5"),
  gaId: process.env.NEXT_PUBLIC_GA_ID ?? "",
} as const;

/** Solo servidor. Lanza si se invoca sin la clave configurada. */
export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada (solo servidor).");
  }
  return key;
}

export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);
