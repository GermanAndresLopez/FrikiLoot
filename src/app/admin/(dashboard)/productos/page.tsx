import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { adminProductRepository } from "@/repositories/adminProductRepository";
import { Button } from "@/components/ui/Button";
import { ProductRow } from "@/features/admin/ProductRow";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const db = await createClient();
  const products = await adminProductRepository.list(db);

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Catálogo</p>
          <h1 className="text-2xl font-bold sm:text-3xl">Productos</h1>
          <p className="mt-1 text-sm text-muted">{products.length} producto(s)</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button size="sm">+ Nuevo</Button>
        </Link>
      </header>

      {products.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No hay productos aún. Crea el primero con “+ Nuevo”.
        </p>
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <ProductRow key={p.id} product={p} />
          ))}
        </ul>
      )}
    </div>
  );
}
