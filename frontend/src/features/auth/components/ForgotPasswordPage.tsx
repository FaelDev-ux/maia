"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/auth.schema";
import { AuthInput } from "./AuthInput";

export function ForgotPasswordPage() {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(_data: ForgotPasswordFormData) {
    await Promise.resolve();
  }

  const recoveryForm = (
    <section className="w-full max-w-[calc(100vw-3rem)] min-w-0 sm:max-w-94">
      <form
        className="w-full min-w-0 rounded-[1.75rem] bg-white/90 px-4 py-6 backdrop-blur sm:px-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <AuthInput
          error={errors.email}
          icon={<Mail size={16} strokeWidth={2.2} />}
          id="email"
          label="E-mail"
          placeholder="nome@exemplo.com"
          registration={register("email")}
          type="email"
        />

        <button
          className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white shadow-button transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Enviando..." : "Enviar instruções"}
        </button>
      </form>

      <Link
        className="mt-5 block text-center text-sm font-semibold text-primary"
        href="/auth?mode=login"
      >
        Voltar para login
      </Link>
    </section>
  );

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-none flex-col justify-center overflow-x-hidden px-6 py-8 md:max-w-[78rem] md:flex-row md:items-center md:gap-16 md:px-10 md:py-10 lg:gap-24">
        <ForgotPasswordCopy />

        <div className="mt-7 flex w-full min-w-0 justify-center md:mt-0 md:max-w-[25rem]">
          {recoveryForm}
        </div>
      </div>
    </main>
  );
}

function ForgotPasswordCopy() {
  return (
    <section className="w-full max-w-[28rem]">
      <header className="mb-7 flex items-center gap-4 md:mb-6">
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

      <h1 className="font-title text-[2rem] font-extrabold leading-tight text-title md:text-5xl">
        Recupere o acesso do <span className="text-primary">seu espaço.</span>
      </h1>

      <p className="mt-4 max-w-96 text-sm leading-6 text-text md:text-base">
        Informe seu e-mail para iniciarmos a recuperação da sua conta.
      </p>
    </section>
  );
}
