import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { env } from "@/lib/env";
import { Analytics } from "@/components/Analytics";
import { Toaster } from "@/components/Toaster";
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

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-dvh antialiased">
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
