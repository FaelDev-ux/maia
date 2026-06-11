"use client";

import { RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Maia application error", error);
  }, [error]);

  return (
    <main className="grid min-h-dvh place-items-center bg-background px-5 py-10 text-text">
      <section className="w-full max-w-[28rem] rounded-[1.5rem] bg-white p-6 text-center shadow-card ring-1 ring-border/70">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-danger/[0.1] text-red-700">
          <TriangleAlert aria-hidden size={25} />
        </span>
        <h1 className="mt-5 font-title text-2xl font-extrabold text-title">
          Nao foi possivel abrir esta parte do Maia
        </h1>
        <p className="mt-3 text-sm leading-6">
          Seus dados continuam seguros. Tente carregar novamente e, se a falha continuar, volte
          para a tela anterior.
        </p>
        <button
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white"
          onClick={reset}
          type="button"
        >
          <RefreshCw aria-hidden size={18} />
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
