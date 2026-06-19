import { getTheme } from "@/services/themeService";
import { ThemeEditor } from "@/features/admin/ThemeEditor";

export const dynamic = "force-dynamic";

export default async function AparienciaPage() {
  const theme = await getTheme();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Personalización</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Apariencia</h1>
        <p className="mt-1 text-sm text-muted">
          Cambia los colores de la tienda. Lo que elijas se aplica a todos los visitantes.
        </p>
      </header>

      <ThemeEditor initial={theme} />
    </div>
  );
}
