import Image from "next/image";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-background px-5 py-6 text-text">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-107.5 md:max-w-none flex-col md:justify-center md:flex-row md:items-center">
        <header className="mb-8 md:hidden flex items-center gap-3">
          <Image
            alt="Maia"
            className="size-12 object-contain"
            height={48}
            priority
            src="/images/logo-maia.png"
            width={48}
          />

          <span className="font-title text-2xl font-bold text-primary">Maia</span>
        </header>

        <section className="md:w-1/2 mb-7 md:flex flex-col items-center md:gap-4">
          <div className="md:flex flex-col items-start">
            <header className="mb-12 md:mb-5 hidden md:flex items-center gap-4">
              <Image
                alt="Maia"
                className="size-12 object-contain"
                height={48}
                priority
                src="/images/logo-maia.png"
                width={48}
              />

              <span className="font-title text-3xl font-bold text-primary">Maia</span>
            </header>
            <h1 className="max-w-[24rem] font-title text-[2rem] font-extrabold leading-tight tracking-[-0.03em] text-title md:text-5xl">
              Bem-vinda de volta ao <span className="text-primary">seu espaço seguro.</span>
            </h1>

            <p className="mt-3 max-w-84 text-sm md:text-md leading-6 text-text">
              Entre para continuar acompanhando seus sentimentos e seus momentos de cuidado.
            </p>
          </div>
        </section>

        <LoginForm />
      </div>
    </main>
  );
}
