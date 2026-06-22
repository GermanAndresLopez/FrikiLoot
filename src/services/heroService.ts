import "server-only";

import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import { DEFAULT_HERO, normalizeHero, type HeroConfig } from "@/lib/hero";
import type { Database } from "@/types/database";

export const HERO_CACHE_TAG = "app-hero";

/** Lee la configuración de la portada (cacheada, invalidable al guardar). */
export const getHero = unstable_cache(
  async (): Promise<HeroConfig> => {
    try {
      const sb = createSupabaseClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await sb.from("app_settings").select("hero").eq("id", 1).maybeSingle();
      if (error || !data) return DEFAULT_HERO;
      return normalizeHero(data.hero);
    } catch {
      return DEFAULT_HERO;
    }
  },
  [HERO_CACHE_TAG],
  { tags: [HERO_CACHE_TAG], revalidate: 3600 }
);
