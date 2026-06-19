import Link from "next/link";
import Image from "next/image";
import type { News } from "@/types/domain";
import { formatDate } from "@/lib/format";
import { truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function NewsCard({ item }: { item: News }) {
  return (
    <Link
      href={`/noticias/${item.id}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {item.image_url ? (
        <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
          <Image
            src={item.image_url}
            alt={item.title ?? "Noticia"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-[16/9] items-center justify-center bg-brand-gradient text-4xl">📰</div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          {item.ends_at ? (
            <Badge tone="warning">Hasta el {formatDate(item.ends_at)}</Badge>
          ) : (
            <Badge tone="accent">Permanente</Badge>
          )}
          <span className="text-xs text-muted">{formatDate(item.created_at)}</span>
        </div>
        {item.title && <h2 className="text-lg font-bold leading-tight">{item.title}</h2>}
        {item.description && (
          <p className="text-sm leading-relaxed text-muted">{truncate(item.description, 120)}</p>
        )}
        <span className="mt-auto pt-1 text-sm font-medium text-primary">
          Ver más <span aria-hidden className="transition-transform group-hover:translate-x-0.5">→</span>
        </span>
      </div>
    </Link>
  );
}
