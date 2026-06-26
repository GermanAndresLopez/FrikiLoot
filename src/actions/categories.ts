"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/authService";
import { categoryRepository } from "@/repositories/categoryRepository";
import { categorySchema } from "@/validations/category";
import { slugify } from "@/lib/utils";

export interface CategoryActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

function parse(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  return categorySchema.safeParse({
    name,
    slug: String(formData.get("slug") || slugify(name)),
    description: String(formData.get("description") ?? ""),
    image_url: String(formData.get("image_url") ?? ""),
    is_active: formData.get("is_active") === "on",
    display_order: formData.get("display_order") ?? 0,
  });
}

export async function saveCategoryAction(
  _prev: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  try {
    const { supabase } = await requireAdmin();
    const id = formData.get("id") ? String(formData.get("id")) : null;

    const parsed = parse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      return { error: "Revisa los campos.", fieldErrors };
    }

    const input = {
      ...parsed.data,
      description: parsed.data.description || undefined,
      image_url: parsed.data.image_url || undefined,
    };

    if (id) await categoryRepository.update(supabase, id, input);
    else await categoryRepository.create(supabase, input);

    revalidatePath("/admin/categorias");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar." };
  }
}

export async function deleteCategoryAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    await categoryRepository.remove(supabase, String(formData.get("id")));
    revalidatePath("/admin/categorias");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al eliminar." };
  }
}
