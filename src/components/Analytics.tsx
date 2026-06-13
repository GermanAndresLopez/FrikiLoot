import Script from "next/script";
import { env } from "@/lib/env";

/** Carga Google Analytics 4 solo si NEXT_PUBLIC_GA_ID está configurado. */
export function Analytics() {
  if (!env.gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${env.gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${env.gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
