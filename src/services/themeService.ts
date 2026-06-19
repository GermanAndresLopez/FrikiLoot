import "server-only";

import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { DEFAULT_THEME, normalizeTheme, type Theme } from "@/lib/theme";
import type { Database } from "@/types/database";

export const THEME_CACHE_TAG = "app-theme";

/**
 * Lee el tema global. Usa un cliente anónimo SIN cookies (compatible con
 * unstable_cache) y cachea el resultado con un tag invalidable al guardar.
 * Si la tabla no existe aún (migración sin aplicar), devuelve el tema por defecto.
 */
export const getTheme = unstable_cache(
  async (): Promise<Theme> => {
    try {
      const sb = createSupabaseClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await sb.from("app_settings").select("theme").eq("id", 1).maybeSingle();
      if (error || !data) return DEFAULT_THEME;
      return normalizeTheme(data.theme);
    } catch {
      return DEFAULT_THEME;
    }
  },
  [THEME_CACHE_TAG],
  { tags: [THEME_CACHE_TAG], revalidate: 3600 }
);
