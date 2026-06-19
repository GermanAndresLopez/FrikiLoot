import { createClient } from "@/lib/supabase/server";
import { newsRepository } from "@/repositories/newsRepository";
import { NewsManager } from "@/features/admin/NewsManager";

export const dynamic = "force-dynamic";

export default async function AdminNoticiasPage() {
  const db = await createClient();
  const items = await newsRepository.listAll(db);

  return (
    <div className="space-y-2">
      <header className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Contenido</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Noticias y eventos</h1>
        <p className="mt-1 text-sm text-muted">
          Publica novedades con imagen, título y descripción. Define una fecha de fin o déjala indefinida.
        </p>
      </header>
      <NewsManager items={items} />
    </div>
  );
}
