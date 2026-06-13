"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/services/authService";
import { notificationRepository } from "@/repositories/notificationRepository";

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const { supabase } = await requireAdmin();
  await notificationRepository.markRead(supabase, String(formData.get("id")));
  revalidatePath("/admin/notificaciones");
}

export async function markAllReadAction(): Promise<void> {
  const { supabase } = await requireAdmin();
  await notificationRepository.markAllRead(supabase);
  revalidatePath("/admin/notificaciones");
}
