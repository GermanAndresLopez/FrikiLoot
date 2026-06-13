import { createClient } from "@/lib/supabase/server";
import { categoryRepository } from "@/repositories/categoryRepository";
import { ProductForm } from "@/features/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NuevoProductoPage() {
  const db = await createClient();
  const categories = await categoryRepository.listAll(db);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Nuevo producto</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
