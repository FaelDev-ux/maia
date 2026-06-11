"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <main style={{ fontFamily: "sans-serif", padding: "2rem", textAlign: "center" }}>
          <h1>O Maia encontrou uma falha inesperada</h1>
          <p>Tente carregar o aplicativo novamente.</p>
          <button onClick={reset} style={{ marginTop: "1rem", padding: "0.75rem 1rem" }}>
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
