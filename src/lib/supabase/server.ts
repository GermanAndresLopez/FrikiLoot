import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para Server Components, Server Actions y Route Handlers.
 * Usa la cookie de sesión del usuario (respeta RLS).
 *
 * El tipo de retorno se ancla a `SupabaseClient<Database>` (de @supabase/supabase-js)
 * para que coincida con el tipo que esperan los repositorios. @supabase/ssr y
 * @supabase/supabase-js declaran genéricos de `SupabaseClient` ligeramente distintos;
 * el cast unifica el cruce en este único punto.
 */
export async function createClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = await cookies();

  return createServerClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Invocado desde un Server Component; el refresh de sesión
          // lo maneja el middleware. Se puede ignorar con seguridad.
        }
      },
    },
  }) as unknown as SupabaseClient<Database>;
}
