import type { Metadata } from "next";

// El admin nunca debe indexarse. El guard de sesión vive en
// el grupo (dashboard); el login queda fuera de ese guard.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
