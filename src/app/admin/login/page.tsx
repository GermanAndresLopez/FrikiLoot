import { Suspense } from "react";
import Image from "next/image";
import type { Metadata } from "next";
import { env } from "@/lib/env";
import { LoginForm } from "@/features/admin/LoginForm";

export const metadata: Metadata = { title: "Ingresar", robots: { index: false } };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image
            src="/logo.jpg"
            alt={env.storeName}
            width={56}
            height={56}
            priority
            className="mx-auto mb-3 h-14 w-14 rounded-xl bg-white"
          />
          <h1 className="text-2xl font-extrabold text-brand-gradient">{env.storeName}</h1>
          <p className="mt-1 text-sm text-muted">Panel administrativo</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
