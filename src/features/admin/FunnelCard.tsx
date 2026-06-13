import type { ConversionFunnel } from "@/types/domain";

function pct(part: number, whole: number): string {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

export function FunnelCard({ funnel }: { funnel: ConversionFunnel }) {
  const steps = [
    { label: "Visitas", value: funnel.visits, base: funnel.visits },
    { label: "Vistas de producto", value: funnel.product_views, base: funnel.visits },
    { label: "Agregados al carrito", value: funnel.cart_adds, base: funnel.product_views },
    { label: "Pedidos WhatsApp", value: funnel.whatsapp_sends, base: funnel.cart_adds },
  ];

  return (
    <section className="rounded-card border border-border bg-surface p-4">
      <h3 className="mb-4 text-sm font-semibold">Embudo de conversión</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.label} className="rounded-lg bg-surface-2 p-3">
            <p className="text-xs text-muted">{s.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{s.value}</p>
            {i > 0 && <p className="text-xs text-accent">{pct(s.value, s.base)} del paso previo</p>}
          </div>
        ))}
      </div>
    </section>
  );
}
