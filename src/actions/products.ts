"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/authService";
import { createAdminClient } from "@/lib/supabase/admin";
import { adminProductRepository } from "@/repositories/adminProductRepository";
import { productSchema, type ProductInput } from "@/validations/product";
import { STORAGE_BUCKET, SIZES, type Size } from "@/lib/constants";
import { slugify } from "@/lib/utils";

export interface ProductActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
  productId?: string;
}

/** Reconstruye las tallas desde el FormData (size_XS=4 …). */
function parseSizes(formData: FormData) {
  const hasSizes = formData.get("has_sizes") === "on";
  if (!hasSizes) return [];
  const sizes: { size: Size; stock: number }[] = [];
  for (const s of SIZES) {
    const raw = formData.get(`size_${s}`);
    if (raw !== null && raw !== "") {
      const stock = Number(raw);
      if (!Number.isNaN(stock)) sizes.push({ size: s, stock });
    }
  }
  return sizes;
}

export async function saveProductAction(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  try {
    const { supabase } = await requireAdmin();
    const id = formData.get("id") ? String(formData.get("id")) : null;
    const name = String(formData.get("name") ?? "");

    const candidate: ProductInput = {
      name,
      slug: String(formData.get("slug") || slugify(name)),
      description: String(formData.get("description") ?? ""),
      category_id: (formData.get("category_id") as string) || null,
      price: Number(formData.get("price") ?? 0),
      stock: Number(formData.get("stock") ?? 0),
      has_sizes: formData.get("has_sizes") === "on",
      is_featured: formData.get("is_featured") === "on",
      is_active: formData.get("is_active") === "on",
      sizes: parseSizes(formData),
    };

    const parsed = productSchema.safeParse(candidate);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      return { error: "Revisa los campos.", fieldErrors };
    }

    let productId = id;
    if (id) {
      await adminProductRepository.update(supabase, id, parsed.data);
    } else {
      productId = await adminProductRepository.create(supabase, parsed.data);
    }
    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    revalidatePath(`/producto/${parsed.data.slug}`);
    return { success: true, productId: productId ?? undefined };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al guardar el producto." };
  }
}

export async function deleteProductAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    await adminProductRepository.remove(supabase, String(formData.get("id")));
    revalidatePath("/admin/productos");
    revalidatePath("/productos");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al eliminar." };
  }
}

/** Alterna el estado "destacado" de un producto (toggle rápido desde la lista). */
export async function toggleFeaturedAction(productId: string, value: boolean): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("products").update({ is_featured: value }).eq("id", productId);
    if (error) throw error;
    revalidatePath("/admin/productos");
    revalidatePath("/");
    revalidatePath("/productos");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al cambiar destacado." };
  }
}

/** Sube una imagen al bucket y la asocia al producto. */
export async function uploadProductImageAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const db = createAdminClient();
    const productId = String(formData.get("product_id"));
    const file = formData.get("file") as File | null;
    const isPrimary = formData.get("is_primary") === "on";

    if (!file || file.size === 0) return { error: "Selecciona un archivo." };
    if (!file.type.startsWith("image/")) return { error: "El archivo debe ser una imagen." };
    if (file.size > 5 * 1024 * 1024) return { error: "Máximo 5 MB por imagen." };

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${productId}/${crypto.randomUUID()}.${ext}`;

    const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    });
    if (upErr) return { error: upErr.message };

    const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

    const { count } = await db
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    await adminProductRepository.addImage(db, productId, pub.publicUrl, count ?? 0, isPrimary || (count ?? 0) === 0);
    revalidatePath(`/admin/productos/${productId}`);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al subir imagen." };
  }
}

/** Sube VARIAS imágenes a la vez. El admin elige cuál es la principal. */
export async function uploadProductImagesAction(
  formData: FormData
): Promise<{ error?: string; uploaded?: number }> {
  try {
    const { supabase } = await requireAdmin();
    const db = createAdminClient();
    const productId = String(formData.get("product_id"));
    const primaryIndex = Number(formData.get("primary_index") ?? 0);
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length === 0) return { error: "Selecciona al menos una imagen." };

    const { count } = await db
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);
    let position = count ?? 0;
    let uploaded = 0;
    let fileIndex = 0;
    let primaryImageId: string | null = null;
    const errors: string[] = [];

    for (const file of files) {
      const currentIndex = fileIndex++;
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: no es una imagen.`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: supera 5 MB.`);
        continue;
      }
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${productId}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
      });
      if (upErr) {
        errors.push(`${file.name}: ${upErr.message}`);
        continue;
      }
      const { data: pub } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      await adminProductRepository.addImage(db, productId, pub.publicUrl, position, false);

      if (currentIndex === primaryIndex) {
        const { data: row } = await db
          .from("product_images")
          .select("id")
          .eq("product_id", productId)
          .eq("url", pub.publicUrl)
          .maybeSingle();
        if (row) primaryImageId = row.id;
      }

      position += 1;
      uploaded += 1;
    }

    if (uploaded > 0 && primaryImageId) {
      await adminProductRepository.setPrimaryImage(db, productId, primaryImageId);
    } else if (uploaded > 0 && (count ?? 0) === 0) {
      const { data: first } = await db
        .from("product_images")
        .select("id")
        .eq("product_id", productId)
        .order("position", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (first) await adminProductRepository.setPrimaryImage(db, productId, first.id);
    }

    revalidatePath(`/admin/productos/${productId}`);
    revalidatePath("/admin/productos");
    if (uploaded === 0) return { error: errors[0] ?? "No se pudo subir." };
    return { uploaded, error: errors.length ? `${errors.length} archivo(s) omitido(s).` : undefined };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al subir imágenes." };
  }
}

export async function deleteProductImageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const db = createAdminClient();
  const imageId = String(formData.get("image_id"));
  const productId = String(formData.get("product_id"));
  await adminProductRepository.removeImage(db, imageId);
  revalidatePath(`/admin/productos/${productId}`);
  revalidatePath("/admin/productos");
}

/** Marca una imagen como principal. */
export async function setPrimaryImageAction(productId: string, imageId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const db = createAdminClient();
    await adminProductRepository.setPrimaryImage(db, productId, imageId);
    revalidatePath(`/admin/productos/${productId}`);
    revalidatePath("/admin/productos");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al cambiar imagen principal." };
  }
}

