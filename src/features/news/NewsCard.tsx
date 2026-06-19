import Image from "next/image";
import type { News } from "@/types/domain";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export function NewsCard({ item }: { item: News }) {
  return (
    <article className="overflow-hidden rounded-card border border-border bg-surface transition-colors hover:border-border/80">
      {item.image_url && (
        <div className="relative aspect-[16/9] bg-surface-2">
          <Image
            src={item.image_url}
            alt={item.title ?? "Noticia"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="space-y-2 p-4">
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
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted">{item.description}</p>
        )}
      </div>
    </article>
  );
}
