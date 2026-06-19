"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/authService";
import { newsRepository, type NewsInsert } from "@/repositories/newsRepository";
import { newsSchema } from "@/validations/news";
import { NEWS_BUCKET } from "@/lib/constants";

export interface NewsActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function revalidateNews() {
  revalidatePath("/admin/noticias");
  revalidatePath("/noticias");
  revalidatePath("/");
}

export async function saveNewsAction(
  _prev: NewsActionState,
  formData: FormData
): Promise<NewsActionState> {
  const { supabase } = await requireAdmin();
  const id = formData.get("id") ? String(formData.get("id")) : null;

  const parsed = newsSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
    is_active: formData.get("is_active") === "on",
    ends_at: String(formData.get("ends_at") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
    return { error: "Revisa los campos.", fieldErrors };
  }

  // Indefinida si está marcada o si no hay fecha.
  const indefinite = formData.get("indefinite") === "on";
  let endsAt: string | null = null;
  if (!indefinite && parsed.data.ends_at) {
    endsAt = new Date(`${parsed.data.ends_at}T23:59:59`).toISOString();
  }

  const input: NewsInsert = {
    title: parsed.data.title?.trim() || null,
    description: parsed.data.description?.trim() || null,
    image_url: parsed.data.image_url?.trim() || null,
    is_active: parsed.data.is_active,
    ends_at: endsAt,
  };

  try {
    if (id) await newsRepository.update(supabase, id, input);
    else await newsRepository.create(supabase, input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }

  revalidateNews();
  return { success: true };
}

export async function deleteNewsAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  await newsRepository.remove(supabase, String(formData.get("id")));
  revalidateNews();
}

/** Sube la imagen de la noticia y devuelve su URL pública. */
export async function uploadNewsImageAction(formData: FormData): Promise<{ url?: string; error?: string }> {
  const { supabase } = await requireAdmin();
  const file = formData.get("file") as File | null;

  if (!file || file.size === 0) return { error: "Selecciona una imagen." };
  if (!file.type.startsWith("image/")) return { error: "El archivo debe ser una imagen." };
  if (file.size > 5 * 1024 * 1024) return { error: "Máximo 5 MB." };

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `news/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage.from(NEWS_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (upErr) return { error: upErr.message };

  const { data: pub } = supabase.storage.from(NEWS_BUCKET).getPublicUrl(path);
  return { url: pub.publicUrl };
}
