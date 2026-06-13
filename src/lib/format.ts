/** Formateo de moneda y valores para locale es-CO (peso colombiano, sin decimales). */

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** 120000 → "$120.000" */
export function formatCOP(value: number): string {
  return COP.format(Math.round(value));
}

const DATE = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDate(value: string | Date): string {
  return DATE.format(typeof value === "string" ? new Date(value) : value);
}

const RELATIVE = new Intl.RelativeTimeFormat("es-CO", { numeric: "auto" });

/** Tiempo relativo corto: "hace 3 h", "hace 2 días". */
export function formatRelative(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const diffMs = date.getTime() - Date.now();
  const sec = Math.round(diffMs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);

  if (Math.abs(sec) < 60) return RELATIVE.format(sec, "second");
  if (Math.abs(min) < 60) return RELATIVE.format(min, "minute");
  if (Math.abs(hr) < 24) return RELATIVE.format(hr, "hour");
  return RELATIVE.format(day, "day");
}
