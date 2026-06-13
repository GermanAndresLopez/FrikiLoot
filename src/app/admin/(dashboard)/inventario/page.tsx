import { createClient } from "@/lib/supabase/server";
import { adminProductRepository } from "@/repositories/adminProductRepository";
import { InventoryManager } from "@/features/admin/InventoryManager";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const db = await createClient();
  const items = await adminProductRepository.listInventory(db);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Stock</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Inventario</h1>
        <p className="mt-1 text-sm text-muted">
          Ajusta cantidades, fija valores exactos y define el umbral de cada producto.
        </p>
      </header>

      <InventoryManager items={items} />
    </div>
  );
}
