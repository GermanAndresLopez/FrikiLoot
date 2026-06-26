"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/authService";
import { adminProductRepository } from "@/repositories/adminProductRepository";

function revalidateInventory() {
  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  revalidatePath("/admin/notificaciones");
  revalidatePath("/productos");
}

export async function adjustStockAction(formData: FormData): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const productId = String(formData.get("product_id"));
    const size = formData.get("size") ? String(formData.get("size")) : null;
    const delta = Number(formData.get("delta") ?? 0);
    if (!productId || !delta) return {};

    if (size) await adminProductRepository.adjustSizeStock(supabase, productId, size, delta);
    else await adminProductRepository.adjustStock(supabase, productId, delta);
    revalidateInventory();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al ajustar stock." };
  }
}

export async function setStockAction(args: {
  productId: string;
  size: string | null;
  value: number;
}): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    const value = Math.max(0, Math.round(args.value));
    if (args.size) await adminProductRepository.setSizeStock(supabase, args.productId, args.size, value);
    else await adminProductRepository.setStock(supabase, args.productId, value);
    revalidateInventory();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al fijar stock." };
  }
}

export async function setThresholdAction(productId: string, value: number): Promise<{ error?: string }> {
  try {
    const { supabase } = await requireAdmin();
    await adminProductRepository.setThreshold(supabase, productId, Math.max(0, Math.round(value)));
    revalidateInventory();
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error al cambiar umbral." };
  }
}
