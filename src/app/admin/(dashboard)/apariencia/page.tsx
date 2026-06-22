import { getTheme } from "@/services/themeService";
import { getHero } from "@/services/heroService";
import { AppearanceTabs } from "@/features/admin/AppearanceTabs";

export const dynamic = "force-dynamic";

export default async function AparienciaPage() {
  const [theme, hero] = await Promise.all([getTheme(), getHero()]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Personalización</p>
        <h1 className="text-2xl font-bold sm:text-3xl">Apariencia</h1>
        <p className="mt-1 text-sm text-muted">
          Cambia los colores de la tienda y la portada del inicio. Todo se aplica a los visitantes.
        </p>
      </header>

      <AppearanceTabs theme={theme} hero={hero} />
    </div>
  );
}
