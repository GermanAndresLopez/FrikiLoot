import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { newsRepository } from "@/repositories/newsRepository";
import { formatDate } from "@/lib/format";
import { truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = await createClient();
  const item = await newsRepository.getById(db, id).catch(() => null);
  if (!item) return { title: "Noticia" };
  const title = item.title ?? "Noticia";
  const description = item.description ? truncate(item.description, 160) : "Novedad de FrikiLoot.";
  return {
    title,
    description,
    openGraph: { title, description, images: item.image_url ? [{ url: item.image_url }] : undefined },
  };
}

export default async function NoticiaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = await createClient();
  const item = await newsRepository.getById(db, id).catch(() => null);
  if (!item) notFound();

  return (
    <article className="mx-auto max-w-2xl space-y-5">
      <Link href="/noticias" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <span aria-hidden>←</span> Volver a noticias
      </Link>

      <div className="flex flex-wrap items-center gap-2">
        {item.ends_at ? (
          <Badge tone="warning">Disponible hasta el {formatDate(item.ends_at)}</Badge>
        ) : (
          <Badge tone="accent">Permanente</Badge>
        )}
        <span className="text-xs text-muted">Publicado el {formatDate(item.created_at)}</span>
      </div>

      {item.title && <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{item.title}</h1>}

      {/* Imagen completa, sin recorte (object-contain en marco estable). */}
      {item.image_url && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-border bg-surface-2">
          <Image
            src={item.image_url}
            alt={item.title ?? "Noticia"}
            fill
            sizes="(max-width: 768px) 100vw, 672px"
            className="object-contain"
            priority
          />
        </div>
      )}

      {item.description && (
        <div className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
          {item.description}
        </div>
      )}
    </article>
  );
}
