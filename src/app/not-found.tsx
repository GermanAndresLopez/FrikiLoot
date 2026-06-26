import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="text-xl font-bold">Página no encontrada</h1>
      <p className="text-sm text-muted">Lo que buscas no existe o fue movido.</p>
      <Link
        href="/"
        className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-hover active:scale-95"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
