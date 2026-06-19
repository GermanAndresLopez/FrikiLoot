import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { newsRepository } from "@/repositories/newsRepository";
import { NewsCard } from "@/features/news/NewsCard";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/Motion";

export const metadata: Metadata = {
  title: "Noticias y eventos",
  description: "Novedades, lanzamientos y eventos de la tienda.",
};

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const db = await createClient();
  const items = await newsRepository.listPublic(db);

  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="text-2xl font-bold sm:text-3xl">Noticias y eventos 📰</h1>
        <p className="mt-1 text-sm text-muted">Lo último de {`FrikiLoot`}: lanzamientos, promos y eventos.</p>
      </Reveal>

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          No hay noticias por ahora. ¡Vuelve pronto! ✨
        </p>
      ) : (
        <StaggerGrid className="grid gap-4 sm:grid-cols-2">
          {items.map((n) => (
            <StaggerItem key={n.id}>
              <NewsCard item={n} />
            </StaggerItem>
          ))}
        </StaggerGrid>
      )}
    </div>
  );
}
