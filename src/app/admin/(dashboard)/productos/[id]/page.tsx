import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { categoryRepository } from "@/repositories/categoryRepository";
import { adminProductRepository } from "@/repositories/adminProductRepository";
import { ProductForm } from "@/features/admin/ProductForm";
import { ProductImageManager } from "@/features/admin/ProductImageManager";

export const dynamic = "force-dynamic";

export default async function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = createAdminClient();
  const userDb = await createClient();

  const [product, categories] = await Promise.all([
    adminProductRepository.getById(db, id),
    categoryRepository.listAll(userDb),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Editar producto</h1>
      <ProductForm categories={categories} product={product} sizes={product.sizes} />
      <ProductImageManager productId={product.id} images={product.images} />
    </div>
  );
}
