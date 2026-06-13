"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/authService";
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

  try {
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

export async function deleteProductAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  await adminProductRepository.remove(supabase, String(formData.get("id")));
  revalidatePath("/admin/productos");
  revalidatePath("/productos");
}

/** Sube una imagen al bucket y la asocia al producto. */
export async function uploadProductImageAction(formData: FormData): Promise<{ error?: string }> {
  const { supabase } = await requireAdmin();
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

  // Posición = cantidad actual de imágenes
  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  await adminProductRepository.addImage(supabase, productId, pub.publicUrl, count ?? 0, isPrimary || (count ?? 0) === 0);
  revalidatePath(`/admin/productos/${productId}`);
  return {};
}

export async function deleteProductImageAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const imageId = String(formData.get("image_id"));
  const productId = String(formData.get("product_id"));
  await adminProductRepository.removeImage(supabase, imageId);
  revalidatePath(`/admin/productos/${productId}`);
}
