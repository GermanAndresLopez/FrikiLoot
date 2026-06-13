import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { adminProductRepository } from "@/repositories/adminProductRepository";
import { formatCOP } from "@/lib/format";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { deleteProductAction } from "@/actions/products";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const db = await createClient();
  const products = await adminProductRepository.list(db);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Link href="/admin/productos/nuevo">
          <Button size="sm">+ Nuevo</Button>
        </Link>
      </div>

      <ul className="space-y-2">
        {products.length === 0 && <li className="text-sm text-muted">No hay productos aún.</li>}
        {products.map((p) => {
          const stock = p.total_size_stock ?? p.stock;
          return (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3"
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                {p.primary_image && (
                  <Image src={p.primary_image} alt={p.name} fill sizes="56px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium">
                  <span className="truncate">{p.name}</span>
                  {p.is_featured && <Badge tone="primary">destacado</Badge>}
                  {!p.is_active && <Badge>inactivo</Badge>}
                </p>
                <p className="text-xs text-muted">
                  {formatCOP(p.price)} ·{" "}
                  <span className={stock === 0 ? "text-danger" : stock <= env.lowStockThreshold ? "text-warning" : ""}>
                    {stock === 0 ? "Agotado" : `${stock} en stock`}
                  </span>
                  {p.category && ` · ${p.category.name}`}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Link href={`/admin/productos/${p.id}`}>
                  <Button size="sm" variant="ghost">Editar</Button>
                </Link>
                <form action={deleteProductAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <Button size="sm" variant="ghost" className="text-danger" type="submit">
                    Eliminar
                  </Button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
