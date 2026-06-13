import { ShopHeader } from "@/components/ShopHeader";
import { ShopFooter } from "@/components/ShopFooter";
import { BottomNav } from "@/components/BottomNav";
import { SplashScreen } from "@/components/SplashScreen";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SplashScreen />

      {/* Accesibilidad: saltar directo al contenido */}
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Saltar al contenido
      </a>

      <ShopHeader />
      <main
        id="contenido"
        className="mx-auto min-h-dvh w-full max-w-6xl px-4 pb-24 pt-4 md:pb-10"
      >
        {children}
      </main>
      <ShopFooter />
      <BottomNav />
    </>
  );
}
