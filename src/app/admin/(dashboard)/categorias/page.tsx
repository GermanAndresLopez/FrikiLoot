import { createClient } from "@/lib/supabase/server";
import { categoryRepository } from "@/repositories/categoryRepository";
import { CategoryManager } from "@/features/admin/CategoryManager";

export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const db = await createClient();
  const categories = await categoryRepository.listAll(db);

  return (
    <div className="space-y-2">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Catálogo</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Categorías</h1>
        <p className="mt-1 text-sm text-muted">Orden alfabético · {categories.length} categoría(s)</p>
      </header>
      <CategoryManager categories={categories} />
    </div>
  );
}
