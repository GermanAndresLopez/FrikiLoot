"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/services/authService";
import { createAdminClient } from "@/lib/supabase/admin";
import { HERO_CACHE_TAG } from "@/services/heroService";
import { heroSchema } from "@/validations/hero";
import { DEFAULT_HERO, type HeroConfig } from "@/lib/hero";
import { NEWS_BUCKET } from "@/lib/constants";

export interface HeroResult {
  error?: string;
  ok?: boolean;
}

/** Guarda la portada del inicio (global). Solo admin. */
export async function saveHeroAction(hero: HeroConfig): Promise<HeroResult> {
  await requireAdmin();

  const parsed = heroSchema.safeParse(hero);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Portada inválida." };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("app_settings")
    .update({ hero: parsed.data, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) return { error: error.message };

  revalidateTag(HERO_CACHE_TAG);
  revalidatePath("/");
  return { ok: true };
}

export async function resetHeroAction(): Promise<HeroResult> {
  return saveHeroAction(DEFAULT_HERO);
}

/** Sube una imagen para la portada y devuelve su URL pública. */
export async function uploadHeroImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  const { supabase } = await requireAdmin();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) return { error: "Selecciona una imagen." };
  if (!file.type.startsWith("image/")) return { error: "El archivo debe ser una imagen." };
  if (file.size > 5 * 1024 * 1024) return { error: "Máximo 5 MB." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `hero/${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage.from(NEWS_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (upErr) return { error: upErr.message };

  const { data: pub } = supabase.storage.from(NEWS_BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl };
}
