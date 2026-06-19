import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { env } from "@/lib/env";
import { Analytics } from "@/components/Analytics";
import { Toaster } from "@/components/Toaster";
import { getTheme } from "@/services/themeService";
import { themeToCss } from "@/lib/theme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: {
    default: `${env.storeName} — Tienda de Anime`,
    template: `%s · ${env.storeName}`,
  },
  description:
    "Suéteres, camisetas, figuras, pines y más merch de anime. Haz tu pedido fácil por WhatsApp.",
  applicationName: env.storeName,
  // Los iconos se generan vía las convenciones app/icon.tsx y app/apple-icon.tsx.
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: env.storeName,
    images: [{ url: "/logo.jpg", width: 1080, height: 1080, alt: env.storeName }],
  },
  twitter: {
    card: "summary",
    images: ["/logo.jpg"],
  },
  robots: { index: true, follow: true },
};

export async function generateViewport(): Promise<Viewport> {
  const theme = await getTheme();
  return {
    themeColor: theme.bg,
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = await getTheme();

  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-dvh antialiased">
        {/* Tema global definido por el admin. Sobreescribe las variables base. */}
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeToCss(theme) }} />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
