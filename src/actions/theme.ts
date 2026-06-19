"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/services/authService";
import { createAdminClient } from "@/lib/supabase/admin";
import { THEME_CACHE_TAG } from "@/services/themeService";
import { themeSchema } from "@/validations/theme";
import { DEFAULT_THEME, type Theme } from "@/lib/theme";

export interface ThemeResult {
  error?: string;
  ok?: boolean;
}

/** Guarda el tema global. Solo admin; se aplica a todos los visitantes. */
export async function saveThemeAction(theme: Theme): Promise<ThemeResult> {
  await requireAdmin();

  const parsed = themeSchema.safeParse(theme);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Tema inválido." };
  }

  const db = createAdminClient();
  const { error } = await db
    .from("app_settings")
    .upsert({ id: 1, theme: parsed.data, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };

  // Refresca el tema en toda la app (SSR usa getTheme con este tag).
  revalidateTag(THEME_CACHE_TAG);
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Restablece al tema por defecto (marca FrikiLoot). */
export async function resetThemeAction(): Promise<ThemeResult> {
  return saveThemeAction(DEFAULT_THEME);
}
