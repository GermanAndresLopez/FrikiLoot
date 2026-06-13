import { createClient } from "@/lib/supabase/server";
import { categoryRepository } from "@/repositories/categoryRepository";
import { CategoryManager } from "@/features/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const db = await createClient();
  const categories = await categoryRepository.listAll(db);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Categorías</h1>
      <CategoryManager categories={categories} />
    </div>
  );
}
