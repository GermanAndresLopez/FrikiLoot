"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-danger/30 bg-danger/5 px-6 py-16 text-center">
      <p className="text-4xl">⚠️</p>
      <h2 className="text-lg font-bold">Algo salió mal</h2>
      <p className="max-w-md text-sm text-muted">
        {error.message || "Ocurrió un error inesperado. Intenta recargar la página."}
      </p>
      <div className="flex gap-2">
        <Button onClick={reset}>Reintentar</Button>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Recargar página
        </Button>
      </div>
    </div>
  );
}
