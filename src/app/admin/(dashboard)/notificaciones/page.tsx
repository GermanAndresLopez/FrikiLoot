import { createClient } from "@/lib/supabase/server";
import { notificationRepository } from "@/repositories/notificationRepository";
import { formatRelative } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { markNotificationReadAction, markAllReadAction } from "@/actions/notifications";
import type { NotificationType } from "@/types/database";

export const dynamic = "force-dynamic";

const toneByType: Record<NotificationType, "danger" | "warning" | "primary" | "accent" | "success"> = {
  agotado: "danger",
  stock_bajo: "warning",
  producto_popular: "primary",
  incremento_visitas: "accent",
  nuevo_pedido: "success",
};

const labelByType: Record<NotificationType, string> = {
  agotado: "Agotado",
  stock_bajo: "Stock bajo",
  producto_popular: "Popular",
  incremento_visitas: "Visitas",
  nuevo_pedido: "Pedido",
};

export default async function NotificacionesPage() {
  const db = await createClient();
  const notifications = await notificationRepository.list(db);
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notificaciones</h1>
        {hasUnread && (
          <form action={markAllReadAction}>
            <Button size="sm" variant="secondary">Marcar todo leído</Button>
          </form>
        )}
      </div>

      <ul className="space-y-2">
        {notifications.length === 0 && <li className="text-sm text-muted">Sin notificaciones.</li>}
        {notifications.map((n) => (
          <li
            key={n.id}
            className={`rounded-xl border p-3 ${
              n.is_read ? "border-border bg-surface" : "border-primary/40 bg-surface-2"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-medium">
                  <Badge tone={toneByType[n.type]}>{labelByType[n.type]}</Badge>
                  <span className="truncate">{n.title}</span>
                </p>
                {n.description && <p className="mt-0.5 text-sm text-muted">{n.description}</p>}
                <p className="mt-1 text-xs text-muted">{formatRelative(n.created_at)}</p>
              </div>
              {!n.is_read && (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <Button size="sm" variant="ghost" type="submit">
                    Leído
                  </Button>
                </form>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
