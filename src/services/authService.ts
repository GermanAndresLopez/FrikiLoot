import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el usuario actual si está autenticado Y en la allowlist de admins.
 * Úsese al inicio de cada Server Action administrativa.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const { data: admin } = await supabase.from("admins").select("id").eq("id", user.id).maybeSingle();
  if (!admin) throw new Error("No autorizado");

  return { supabase, user };
}

/** Versión no-lanzadora para usar en layouts/guards. */
export async function getAdminUser() {
  try {
    const { user } = await requireAdmin();
    return user;
  } catch {
    return null;
  }
}
