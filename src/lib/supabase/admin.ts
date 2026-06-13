import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env, getServiceRoleKey } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cliente con SERVICE ROLE. Omite RLS — usar SOLO en código de servidor
 * para escrituras de analítica (product_views, cart_events, whatsapp_orders)
 * y tareas administrativas controladas. Nunca importar en el cliente.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(env.supabaseUrl, getServiceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
