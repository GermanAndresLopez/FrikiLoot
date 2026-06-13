import { cn } from "@/lib/utils";

type Tone = "default" | "danger" | "warning" | "accent";

const toneText: Record<Tone, string> = {
  default: "text-foreground",
  danger: "text-danger",
  warning: "text-warning",
  accent: "text-accent",
};

export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number | string;
  tone?: Tone;
}) {
  return (
    <div className="rounded-card border border-border bg-surface p-4">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold tabular-nums", toneText[tone])}>{value}</p>
    </div>
  );
}
