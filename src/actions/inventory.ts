"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/authService";
import { adminProductRepository } from "@/repositories/adminProductRepository";

/** Ajusta el stock de un producto (o de una talla) por un delta. */
export async function adjustStockAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  const productId = String(formData.get("product_id"));
  const size = formData.get("size") ? String(formData.get("size")) : null;
  const delta = Number(formData.get("delta") ?? 0);
  if (!productId || !delta) return;

  if (size) {
    await adminProductRepository.adjustSizeStock(supabase, productId, size, delta);
  } else {
    await adminProductRepository.adjustStock(supabase, productId, delta);
  }
  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
}
