import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // El type-checking sí corre en el build (tsc). Solo evitamos que un fallo de
  // carga de plugins de ESLint (dep transitiva rota) pueda tumbar el deploy.
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
